import 'dotenv/config'
import cluster from 'node:cluster'
import os from 'node:os'
import { runApp } from './app.js'
import { createLoadBalancer } from './cluster/load-balancer.js'
import { handleStoreMessage } from './cluster/store-ipc-handler.js'

const clusterMode = process.argv.includes('--cluster')
const basePort = Number(process.env.PORT) || 4000
const host = process.env.HOST ?? '127.0.0.1'

if (clusterMode && cluster.isPrimary) {
    const numWorkers = Math.max(1, os.cpus().length - 1)
    const workerPorts = Array.from(
        { length: numWorkers },
        (_, i) => basePort + 1 + i,
    )

    const pidToPort: Record<number, number> = {}

    for (let i = 0; i < numWorkers; i++) {
        const port = workerPorts[i]!
        const worker = cluster.fork({
            CLUSTER_WORKER_PORT: String(port),
        })
        const pid = worker.process.pid
        if (pid) {
            pidToPort[pid] = port
        }
        worker.on('message', (message) => {
            handleStoreMessage(worker, message)
        })
    }

    cluster.on('exit', (deadWorker) => {
        const deadPid = deadWorker.process.pid
        if (!deadPid) return

        const freedPort = pidToPort[deadPid]
        if (!freedPort) return

        delete pidToPort[deadPid]
        const replacement = cluster.fork({ CLUSTER_WORKER_PORT: String(freedPort) })
        const newPid = replacement.process.pid
        if (newPid) {
            pidToPort[newPid] = freedPort
        }
        replacement.on('message', (message) => {
            handleStoreMessage(replacement, message)
        })
    })

    const loadBalancer = await createLoadBalancer(workerPorts)
    try {
        await loadBalancer.listen({ port: basePort, host })
    } catch (err) {
        if (err && typeof err === 'object' && 'code' in err && err.code === 'EADDRINUSE') {
            console.error(
                `Port ${String(basePort)} is already in use (another process or a previous server). Stop it or set PORT to a free port.`,
            )
        }
        throw err
    }
    console.log(
        `Load balancer listening at http://${host}:${String(basePort)} (workers: ${workerPorts.join(', ')})`,
    )
} else {
    const port =
        clusterMode && cluster.isWorker
            ? Number(process.env.CLUSTER_WORKER_PORT)
            : Number(process.env.PORT) || 4000
    if (clusterMode && cluster.isWorker && !Number.isFinite(port)) {
        throw new Error('CLUSTER_WORKER_PORT must be set for cluster workers')
    }
    const app = await runApp()
    let address: string
    try {
        address = await app.listen({ port, host })
    } catch (err) {
        if (err && typeof err === 'object' && 'code' in err && err.code === 'EADDRINUSE') {
            console.error(
                `Port ${String(port)} is already in use. Stop the other process or set PORT / CLUSTER_WORKER_PORT.`,
            )
        }
        throw err
    }
    console.log(`Server listening at ${address}`)
}
