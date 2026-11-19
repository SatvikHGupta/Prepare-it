// the address is kept in two encoded pieces and only joined in the browser after a tap,
// so it never appears in the page HTML that search engines and spam bots read
const USER = 'c2F0dmlraGd1cHRh';
const HOST = 'Z21haWwuY29t';

export function getContactEmail() {
  return process.env.NEXT_PUBLIC_CONTACT_EMAIL || `${atob(USER)}@${atob(HOST)}`;
}
