import { Router } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { Board, Element, Session } from '../models/index.js'

const router = Router()

// POST /api/board/create
router.post('/create', async (req, res) => {
  try {
    const { title } = req.body
    const roomId = uuidv4().slice(0, 12)

    const board = await Board.create({
      title: title || 'Untitled Board',
      roomId,
    })

    res.json({
      boardId: board.roomId,
      roomId: board.roomId,
      shareUrl: `${process.env.CLIENT_URL || 'http://localhost:5173'}/board/${board.roomId}`,
    })
  } catch (err) {
    console.error('[Board Create]', err)
    res.status(500).json({ error: 'Failed to create board' })
  }
})

// GET /api/board/:id
router.get('/:id', async (req, res) => {
  try {
    const board = await Board.findOne({ roomId: req.params.id })
    if (!board) {
      return res.status(404).json({ error: 'Board not found or session expired' })
    }

    const elements = await Element.find({ boardId: req.params.id }).lean()
    res.json({ board, elements })
  } catch (err) {
    console.error('[Board Get]', err)
    res.status(500).json({ error: 'Failed to fetch board' })
  }
})

// DELETE /api/board/:id
router.delete('/:id', async (req, res) => {
  try {
    await Board.deleteOne({ roomId: req.params.id })
    await Element.deleteMany({ boardId: req.params.id })
    await Session.deleteMany({ boardId: req.params.id })
    res.json({ success: true })
  } catch (err) {
    console.error('[Board Delete]', err)
    res.status(500).json({ error: 'Failed to delete board' })
  }
})

// PATCH /api/board/:id — rename board
router.patch('/:id', async (req, res) => {
  try {
    const { title } = req.body
    const board = await Board.findOneAndUpdate(
      { roomId: req.params.id },
      { title: title || 'Untitled Board' },
      { new: true }
    )
    if (!board) return res.status(404).json({ error: 'Board not found' })
    res.json({ success: true, board })
  } catch (err) {
    console.error('[Board Rename]', err)
    res.status(500).json({ error: 'Failed to rename board' })
  }
})

// GET /api/board/:id/export/json
router.get('/:id/export/json', async (req, res) => {
  try {
    const board = await Board.findOne({ roomId: req.params.id })
    if (!board) return res.status(404).json({ error: 'Board not found' })

    const elements = await Element.find({ boardId: req.params.id }).lean()
    res.json({ board, elements })
  } catch (err) {
    res.status(500).json({ error: 'Export failed' })
  }
})

// POST /api/board/save (save temporary state)
router.post('/save', async (req, res) => {
  try {
    const { boardId, elements } = req.body
    if (!boardId) return res.status(400).json({ error: 'boardId required' })

    for (const el of elements) {
      await Element.findOneAndUpdate(
        { id: el.id, boardId },
        { ...el, boardId },
        { upsert: true, new: true }
      )
    }

    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Save failed' })
  }
})

export default router
