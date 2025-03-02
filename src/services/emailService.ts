import sgMail from '@sendgrid/mail';

// Initialize SendGrid with your API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

export async function sendWelcomeEmail(userEmail: string, userName: string): Promise<void> {
    const msg = {
        to: userEmail,
        from: 'mnetemohamed@gmail.com',  // Your email
        subject: `Karibu Bimasoft Insurance, ${userName}!`,
        text: `Hello ${userName},\n\nWelcome to Bimasoft Insurance! We're excited to have you with us. You now have access to our platform where you can manage your insurance policies, get quotes, and explore other services we offer.\n\nBimaSoft aims to make insurance provision faster, easier, more transparent, and engaging for both customers and service providers. We believe in data-driven decision-making and providing innovative, modern solutions. Our platform is designed to enhance your experience and deliver the best insurance services.\n\nIf you have any questions, please feel free to contact us. We are here to assist and ensure you have the best experience.\n\nBest regards,\nMohamed Mnete from the Bimasoft Team`,
        html: `<p>Hello <strong>${userName}</strong>,</p>
               <p>Welcome to the Bimasoft Insurance Platform! We're thrilled to have you with us. </p>
               <p>BimaSoft aims to make insurance provision faster, easier, more transparent, and engaging for both customers and service providers. We believe in data-driven decision-making and providing innovative, modern solutions. Our platform is designed to improve your experience and offer the best insurance services.</p>
               <p>If you have any questions, feel free to reach out to us. We are happy to provide support and ensure you have the best experience.</p>
               <p>Best regards, <br/>Mohamed Mnete from the Bimasoft Team</p>`,
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
export async function sendPasswordEmail(userEmail: string, password: string, loginLink: string): Promise<void> {
    const msg = {
        to: userEmail,
        from: 'mnetemohamed@gmail.com',  // Your email
        subject: 'Welcome to BimaSoft! Your One-Time Password (OTP) and Login Link',
        text: `Your OTP is: ${password}. You can log in using the following link: ${loginLink}`,
        html: `<p>Your OTP is: <strong>${password}</strong>.</p><p>You can log in using the following link: <a href="${loginLink}">${loginLink}</a></p>`,
    };

    try {
        await sgMail.send(msg);
        console.log(`OTP email sent to ${userEmail}`);
    } catch (error) {
        console.error('Error sending OTP email:', error);
        throw new Error('Unable to send OTP email');
    }
}

// Function to send company approval email to the admin
export async function sendCompanyApprovalEmail(adminEmail: string, companyDetails: any): Promise<void> {
    const msg = {
        to: adminEmail,
        from: 'mnetemohamed@gmail.com',  // Your email
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
