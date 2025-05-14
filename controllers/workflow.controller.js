import dayjs from 'dayjs'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)

import Subscription from '../models/subscription.model.js'

const REMINDERS = [7, 5, 2, 1]

// Upstash workflow written in common js, so require is used.
const { serve } = require('@upstash/workflow/express')

export const sendReminders = serve(async (context) => {
	const { subscriptionId } = context.requestPayload
	const subscription = await fetchSubscription(context, subscriptionId)

	if (!subscription || subscription.status !== 'active') return

	const renewalDate = dayjs(subscription.renewalDate)

	if (renewalDate.isBefore(dayjs())) {
		console.log(`Subscription ${subscriptionId} is already expired.`)
		return
	}

	for (const daysBefore of REMINDERS) {
		const reminderDate = renewalDate.subtract(daysBefore, 'day')

		if (reminderDate.isAfter(dayjs())) {
			await sleepUnitlReminder(
				context,
				`Reminder ${daysBefore} days before`,
				reminderDate
			)
		}

		await triggerReminder(context, `Reminder ${daysBefore} days before`)
	}
})

const fetchSubscription = async (context, subscriptionId) => {
	return await context.run('get subscription', async () => {
		return Subscription.findById(subscriptionId).populate('user', 'name email')
	})
}

const sleepUnitlReminder = async (context, label, date) => {
	console.log(`Sleeping until ${label} reminder at ${date}`)
	await context.sleepUntil(label, date.toDate())
}

const triggerReminder = async (context, label) => {
	return await context.run(label, () => {
		console.log(`Triggering ${label} reminder`)
	})
}
