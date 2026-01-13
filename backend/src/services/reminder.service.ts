import cron from 'node-cron';
import prisma from '../utils/prisma';

export const checkSubscriptionReminders = async () => {
  try {
    const now = new Date();
    const reminders = await prisma.subscriptionReminder.findMany({
      where: {
        sent: false,
        reminderDate: {
          lte: now,
        },
      },
      include: {
        subscription: true,
      },
    });

    for (const reminder of reminders) {
      console.log(`📧 Reminder: ${reminder.subscription.name} payment due on ${reminder.subscription.nextPaymentDate}`);
      
      await prisma.subscriptionReminder.update({
        where: { id: reminder.id },
        data: { sent: true },
      });
    }

    if (reminders.length > 0) {
      console.log(`✅ Processed ${reminders.length} subscription reminders`);
    }
  } catch (error) {
    console.error('Error checking subscription reminders:', error);
  }
};

export const startReminderCron = () => {
  cron.schedule('0 9 * * *', () => {
    console.log('🔔 Running daily reminder check...');
    checkSubscriptionReminders();
  });

  console.log('✅ Reminder cron job started (runs daily at 9:00 AM)');
};
