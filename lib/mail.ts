import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerificationEmail = async (email: string, token: string) => {
   const confirmLink = `http://localhost:3000/nova-verifikacija?token=${token}`;

   await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "digitaliqhr@gmail.com", //   //PROMIJENITI ovo u email iz parametra kad se verificira domena
      subject: "Potvrdite svoj email",
      html: `<p>Klikni kako bi potvrdio svoju email adresu</p>
      <a href="${confirmLink}">
      <button>POTVRDI SVOJU EMAIL ADRESU</button></a>
      `,
   });
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
   const resetPasswordLink = `http://localhost:3000/nova-lozinka?token=${token}`;

   await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "digitaliqhr@gmail.com", //   //PROMIJENITI ovo u email iz parametra kad se verificira domena
      subject: "Resetiraj svoju lozinku",
      html: `<p>Klikni kako bi resetirao svoju lozinku</p>
      <a href="${resetPasswordLink}">
      <button>RESETIRAJ SVOJU LOZINKU</button></a>
      `,
   });
};
