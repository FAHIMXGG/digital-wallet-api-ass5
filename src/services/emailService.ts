import nodemailer from 'nodemailer';
import config from '../config';

// Create transporter
const createTransporter = () => {
  if (!config.email_host || !config.email_user || !config.email_password) {
    throw new Error('Email configuration is incomplete. Please check your environment variables.');
  }

  return nodemailer.createTransport({
    host: config.email_host,
    port: config.email_port,
    secure: config.email_port === 465, // true for 465, false for other ports
    auth: {
      user: config.email_user,
      pass: config.email_password,
    },
  });
};

/**
 * Send email verification OTP
 */
export const sendEmailVerificationOTP = async (
  email: string,
  name: string,
  otp: string
): Promise<void> => {
  const transporter = createTransporter();

  const mailOptions = {
    from: config.email_from,
    to: email,
    subject: 'Email Verification - Digital Wallet',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Email Verification</h2>
        <p>Hello ${name},</p>
        <p>Thank you for registering with Digital Wallet. Please use the following OTP to verify your email address:</p>
        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
          <h1 style="color: #007bff; font-size: 32px; margin: 0;">${otp}</h1>
        </div>
        <p>This OTP will expire in ${Math.floor(config.otp_expires_in / 60)} minutes.</p>
        <p>If you didn't create an account with us, please ignore this email.</p>
        <hr style="margin: 30px 0;">
        <p style="color: #666; font-size: 12px;">Digital Wallet Team</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

/**
 * Send password reset OTP
 */
export const sendPasswordResetOTP = async (
  email: string,
  name: string,
  otp: string
): Promise<void> => {
  const transporter = createTransporter();

  const mailOptions = {
    from: config.email_from,
    to: email,
    subject: 'Password Reset - Digital Wallet',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>Hello ${name},</p>
        <p>You have requested to reset your password. Please use the following OTP to proceed:</p>
        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
          <h1 style="color: #dc3545; font-size: 32px; margin: 0;">${otp}</h1>
        </div>
        <p>This OTP will expire in ${Math.floor(config.otp_expires_in / 60)} minutes.</p>
        <p>If you didn't request a password reset, please ignore this email and your password will remain unchanged.</p>
        <hr style="margin: 30px 0;">
        <p style="color: #666; font-size: 12px;">Digital Wallet Team</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

/**
 * Send welcome email after successful verification
 */
export const sendWelcomeEmail = async (
  email: string,
  name: string
): Promise<void> => {
  const transporter = createTransporter();

  const mailOptions = {
    from: config.email_from,
    to: email,
    subject: 'Welcome to Digital Wallet!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #28a745;">Welcome to Digital Wallet!</h2>
        <p>Hello ${name},</p>
        <p>Congratulations! Your email has been successfully verified and your account is now active.</p>
        <p>You can now enjoy all the features of Digital Wallet:</p>
        <ul>
          <li>Send and receive money</li>
          <li>Add money to your wallet</li>
          <li>Withdraw funds</li>
          <li>Track your transactions</li>
        </ul>
        <p>Thank you for choosing Digital Wallet!</p>
        <hr style="margin: 30px 0;">
        <p style="color: #666; font-size: 12px;">Digital Wallet Team</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};
