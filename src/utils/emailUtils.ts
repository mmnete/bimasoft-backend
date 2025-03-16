import sgMail from '@sendgrid/mail';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Initialize SendGrid with your API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

const SENDER_EMAIL = 'mnetemohamed@gmail.com';
const LOGIN_URL = 'bimasoft.com/auth/login';

export async function sendWelcomeEmail(userEmail: string, userName: string): Promise<void> {
    const msg = {
        to: userEmail,
        from: SENDER_EMAIL,  // Your email
        subject: `Karibu Bimasoft Insurance, ${userName}!`,
        text: `Hello ${userName},

Welcome to Bimasoft Insurance! We're excited to have you join our platform designed specifically for Tanzanian insurance companies and brokers like you.

What is Bimasoft?

Bimasoft is a platform that simplifies and streamlines your insurance operations. We help you:

- Manage policies efficiently.
- Provide quick and accurate quotes to your customers.
- Gain valuable insights into customer trends.
- Offer a wide range of insurance products.

Benefits of Using Bimasoft:

- Reduced Costs: Streamline your operations and offer more affordable insurance options.
- Data-Driven Decisions: Access customer data and make informed business decisions.
- Increased Transparency: Provide a clear and transparent insurance experience for your customers.

Next Steps:

You will receive a follow-up email with your login details shortly. Once you've logged in, you can start exploring the platform and utilizing its features to enhance your insurance services.

Need Assistance?

If you have any questions, please feel free to contact us via WhatsApp (+15104248843) or email at mnetemohamed@gmail.com. We're here to support you every step of the way.

Karibu sana!

Best regards,  
Mohamed Mnete  
Bimasoft Team`,

        html: `<p>Hello ${userName},</p>
                <p>Welcome to Bimasoft Insurance! We're excited to have you join our platform designed specifically for Tanzanian insurance companies and brokers like you.</p>
  
                <h3>What is Bimasoft?</h3>
                <p>Bimasoft is a platform that simplifies and streamlines your insurance operations. We help you:</p>
                <ul>
                    <li>Manage policies efficiently.</li>
                    <li>Provide quick and accurate quotes to your customers.</li>
                    <li>Gain valuable insights into customer trends.</li>
                    <li>Offer a wide range of insurance products.</li>
                </ul>
  
                <h3>Benefits of Using Bimasoft:</h3>
                <ul>
                    <li>Reduced Costs: Streamline your operations and offer more affordable insurance options.</li>
                    <li>Data-Driven Decisions: Access customer data and make informed business decisions.</li>
                    <li>Increased Transparency: Provide a clear and transparent insurance experience for your customers.</li>
                </ul>
  
                <h3>Next Steps:</h3>
                <p>You will receive a follow-up email with your admin login details shortly. Once you've logged in, you can start exploring the platform and utilizing its features to enhance your insurance services.</p>

                <h3>Need Assistance?</h3>
                <p>If you have any questions, please feel free to reach out to us:</p>
                <ul>
                    <li><a href="https://wa.me/15104248843">WhatsApp: +15104248843</a></li>
                    <li><a href="mailto:mnetemohamed@gmail.com">Email: mnetemohamed@gmail.com</a></li>
                </ul>
  
                <p>Karibu sana! <br/><br/>Best regards, <br/>Mohamed Mnete <br/>Bimasoft Team</p>`,
    };

    try {
        await sgMail.send(msg);
        console.log(`Welcome email sent to ${userEmail}`);
    } catch (error) {
        console.error('Error sending welcome email:', error);
        throw new Error('Unable to send welcome email');
    }
}


// Function to send the password email to the user with login details
export async function sendPasswordEmail(userEmail: string, password: string): Promise<void> {
    const msg = {
        to: userEmail,
        from: SENDER_EMAIL,  // Your email
        subject: 'Welcome to BimaSoft! Login details',
        text: `Your custom password is: ${password}. You can log in using the following link: ${LOGIN_URL}. Once logged in, you can change your password from your account settings.`,
        html: `<p>Your custom password is: <strong>${password}</strong>.</p>
               <p>You can log in using the following link: <a href="${LOGIN_URL}">${LOGIN_URL}</a></p>
               <p>Once logged in, you can change your password from your account settings.</p>`,
    };

    try {
        await sgMail.send(msg);
        console.log(`Login details email sent to ${userEmail}`);
    } catch (error) {
        console.error('Error sending login details email:', error);
        throw new Error('Unable to send login details email');
    }
}


// Function to send company approval email to the admin
export async function sendCompanyApprovalEmail(adminEmail: string, companyDetails: any): Promise<void> {
    const msg = {
        to: adminEmail,
        from: SENDER_EMAIL,  // Your email
        subject: `New Company Created - ${companyDetails.companyName}`,
        text: `A new company has been created and is waiting for approval. Here are the details:\n\nCompany Name: ${companyDetails.companyName}\nCompany Email: ${companyDetails.companyEmail}\nCompany Address: ${companyDetails.companyAddress}\n\nPlease review and approve the company.`,
        html: `<p>A new company has been created and is waiting for approval. Here are the details:</p>
               <p><strong>Company Name:</strong> ${companyDetails.companyName}</p>
               <p><strong>Company Email:</strong> ${companyDetails.companyEmail}</p>
               <p><strong>Company Address:</strong> ${companyDetails.companyAddress}</p>
               <p>Please review and approve the company.</p>`,
    };

    try {
        await sgMail.send(msg);
        console.log(`Company approval email sent to ${adminEmail}`);
    } catch (error) {
        console.error('Error sending company approval email:', error);
        throw new Error('Unable to send company approval email');
    }
}
