const express = require('express');

const db = require('../data/db.js');

const router = express.Router();

router.use(express.json());

router.get('/', (req, res) => {
  db.find()
    .then(posts => res.status(200).json(posts))
    .catch(err => res.status(500).json({errMsg: 'error getting posts'}))
})

router.get('/:id', (req, res) => {
  db.findById(req.params.id)
    .then(post => {
      if (post) {
        res.status(200).json(post)
      } else {
        res.status(404).json({errMsg: 'post not found'})
      }
    })
    .catch(err => res.status(500).json({errMsg: 'error getting post'}))
})

router.get('/:id/comments', (req, res) => {
  db.findPostComments(req.params.id)
    .then(comments => {
      if (comments) {
        res.status(200).json(comments)
      } else {
        res.status(404).json({errMsg: 'post not found'})
      }
    })
    .catch(err => res.status(500).json({errMsg: 'error getting comments'}))
})

router.post('/', (req, res) => {
  if (!req.body.title || !req.body.contents) {
    res.status(400).json({errMsg: 'title and contents are required'})
  } else {
    db.insert(req.body)
      .then(postId => {
        db.findById(postId.id)
          .then(post => res.status(201).json(post))
      })
      .catch(err => res.status(500).json({errMsg: 'error adding post'}))
  }
})

router.post('/:id/comments', (req, res) => {
  db.findById(req.params.id)
    .then(post => {
      if (post) {
        const newComment = {...req.body, post_id: req.params.id}
        if (!req.body.text) {
          res.status(400).json({errMsg: 'text is required'})
        } else {
          db.insertComment(newComment)
            .then(commentId => {
              db.findCommentById(commentId.id)
                .then(comment => res.status(201).json(comment))
            })
            .catch(err => res.status(500).json({errMsg: 'error adding comment'}))
        }
      } else {
        res.status(404).json({errMsg: 'post not found'})
      }
    })
    .catch(err => res.status(500).json({errMsg: 'error adding comment'}))
})

router.delete('/:id', (req, res) => {
  db.findById(req.params.id)
    .then(post => {
      if (post) {
        db.remove(req.params.id)
        .then(resp => res.status(200).json(post))
        .catch(err => res.status(500).json({errMsg: 'error deleting post'}))
      } else {
        res.status(404).json({errMsg: 'post not found'})
      }
    })
    .catch(err => res.status(500).json({errMsg: 'error deleting post'}))
})

router.put('/:id', (req, res) => {
  db.findById(req.params.id)
    .then(post => {
      if (post.length) {
        if (req.body.title && req.body.contents) {
          db.update(req.params.id, req.body)
            .then(resp => {
              db.findById(req.params.id)
                .then(updatedPost => res.status(200).json(updatedPost))
                .catch(err => res.status(500).json({errMsg: 'error retrieving updated post'}))
            })
            .catch(err => res.status(500).json({errMsg: 'error updating post'}))
        } else {
          res.status(400).json({errMsg: 'title and contents are required'})
        } 
      } else {
        res.status(404).json({errMsg: 'post not found'})
      }
    })
    .catch(err => res.status(500).json({errMsg: 'error finding post'}))
})





module.exports = router