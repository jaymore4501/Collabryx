import { Board, Element, Session } from '../models/index.js'

/**
 * Cleanup worker that runs every 60 seconds.
 * Deletes boards/elements/sessions where no heartbeat received for 2 minutes.
 */
export function startCleanupWorker() {
  console.log('[Cleanup] Worker started — interval: 60s, stale threshold: 2min')

  setInterval(async () => {
    try {
      const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000)

      // Find stale sessions (no heartbeat in 2 minutes)
      const staleSessions = await Session.find({
        lastHeartbeat: { $lt: twoMinutesAgo },
      }).lean()

      if (staleSessions.length === 0) return

      // Group by boardId
      const boardIds = [...new Set(staleSessions.map((s) => s.boardId))]

      for (const boardId of boardIds) {
        // Delete stale sessions for this board
        await Session.deleteMany({
          boardId,
          lastHeartbeat: { $lt: twoMinutesAgo },
        })

        // Check if any active sessions remain
        const activeCount = await Session.countDocuments({ boardId })

        if (activeCount === 0) {
          // No active users — delete entire board
          console.log(`[Cleanup] Deleting stale board: ${boardId}`)
          await Board.deleteOne({ roomId: boardId })
          await Element.deleteMany({ boardId })
          await Session.deleteMany({ boardId })
        }
      }
    } catch (err) {
      console.error('[Cleanup] Error:', err)
    }
  }, 60 * 1000) // Run every 60 seconds
}
