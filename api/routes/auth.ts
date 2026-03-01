/**
 * This is a user authentication API route demo.
 * Handle user registration, login, token management, etc.
 */
import { Router, type Request, type Response } from 'express'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import dotenv from 'dotenv'

dotenv.config()

const router = Router()

const supabaseUrl = process.env.VITE_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const resendApiKey = process.env.RESEND_API_KEY || ''

const supabase = createClient(supabaseUrl, supabaseServiceKey)
const resend = new Resend(resendApiKey)

/**
 * Request Password Reset
 * POST /api/auth/forgot-password
 */
router.post('/forgot-password', async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body

  if (!email) {
    res.status(400).json({ success: false, message: 'Email é obrigatório' })
    return
  }

  try {
    // 1. Generate recovery link using Supabase Admin
    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: {
        redirectTo: `${process.env.APP_URL || 'http://localhost:5173'}/reset-password`
      }
    })

    if (error) throw error

    const resetLink = data.properties.action_link

    // 2. Send email via Resend
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'Partex <onboarding@resend.dev>', // Use a verified domain in production
      to: [email],
      subject: 'Redefinição de Senha - Partex',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="background-color: #f97316; color: white; width: 40px; height: 40px; line-height: 40px; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 24px;">P</div>
            <h1 style="color: #1a202c; margin-top: 10px;">PARTEX</h1>
          </div>
          
          <div style="background-color: #ffffff; padding: 30px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #1a202c; margin-bottom: 20px;">Olá!</h2>
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
              Recebemos uma solicitação para redefinir a senha da sua conta no Partex. Se você não fez essa solicitação, pode ignorar este email.
            </p>
            
            <div style="text-align: center; margin-bottom: 30px;">
              <a href="${resetLink}" style="background-color: #f97316; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
                Redefinir minha senha
              </a>
            </div>
            
            <p style="font-size: 14px; color: #718096; margin-bottom: 20px;">
              Este link expirará em breve por motivos de segurança.
            </p>
            
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 25px 0;" />
            
            <p style="font-size: 12px; color: #a0aec0; text-align: center;">
              Se o botão acima não funcionar, copie e cole o link abaixo no seu navegador:
              <br />
              <span style="word-break: break-all; color: #f97316;">${resetLink}</span>
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; color: #a0aec0; font-size: 12px;">
            &copy; ${new Date().getFullYear()} Partex Marketplace. Todos os direitos reservados.
          </div>
        </div>
      `
    })

    if (emailError) throw emailError

    res.status(200).json({ success: true, message: 'Email de redefinição enviado' })
  } catch (error: any) {
    console.error('Password reset request error:', error)
    res.status(500).json({ success: false, message: error.message || 'Erro ao processar solicitação' })
  }
})

/**
 * User Login
 * POST /api/auth/register
 */
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  // TODO: Implement register logic
})

/**
 * User Login
 * POST /api/auth/login
 */
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  // TODO: Implement login logic
})

/**
 * User Logout
 * POST /api/auth/logout
 */
router.post('/logout', async (req: Request, res: Response): Promise<void> => {
  // TODO: Implement logout logic
})

export default router
