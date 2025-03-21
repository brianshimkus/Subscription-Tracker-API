import { Router } from 'express'

const workflowRouter = Router()

workflowRouter.get('/', (req, res) => {
	res.json({ message: 'Workflow route' })
})

export default workflowRouter
