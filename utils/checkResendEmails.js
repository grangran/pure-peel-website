import { Resend } from 'resend'
import dotenv from 'dotenv'

dotenv.config()

// Helper to check Resend email status
export const checkResendEmailStatus = async (messageId) => {
  if (!process.env.RESEND_API_KEY) {
    return { error: 'RESEND_API_KEY not configured' }
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    
    // Note: Resend API doesn't have a direct "get email by ID" endpoint in the SDK
    // But we can check the dashboard or use webhooks
    
    return {
      message: 'Check Resend dashboard for email status',
      dashboardUrl: 'https://resend.com/emails',
      messageId: messageId
    }
  } catch (error) {
    return { error: error.message }
  }
}


