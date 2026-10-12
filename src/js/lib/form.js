// Validation for the demo contact form. Pure functions so they can be unit-tested in Node.

export const PURPOSES = [
  'Website project',
  'Social media marketing',
  'Ad campaigns',
  'Lead generation',
  'Other',
];

export const MESSAGE_MAX = 1000;

// Deliberately modest: one @, no spaces, a dot in the domain, no leading or trailing dot.
const EMAIL = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;

export function isEmail(value) {
  const v = String(value ?? '').trim();
  return v.length <= 254 && EMAIL.test(v);
}

/**
 * @param {{name?: string, email?: string, purpose?: string, message?: string}} fields
 * @returns {{ok: boolean, errors: Record<string, string>, values: Record<string, string>}}
 */
export function validateContact(fields = {}) {
  const values = {
    name: String(fields.name ?? '').trim().replace(/\s+/g, ' '),
    email: String(fields.email ?? '').trim(),
    purpose: String(fields.purpose ?? '').trim(),
    message: String(fields.message ?? '').trim(),
  };
  const errors = {};

  if (!values.name) errors.name = 'Enter your name.';
  else if (values.name.length < 2) errors.name = 'Enter at least two characters.';
  else if (values.name.length > 80) errors.name = 'Keep the name under 80 characters.';

  if (!values.email) errors.email = 'Enter an email address.';
  else if (!isEmail(values.email)) errors.email = 'Enter an email address like name@example.com.';

  if (!values.purpose) errors.purpose = 'Choose what the request is about.';
  else if (!PURPOSES.includes(values.purpose)) errors.purpose = 'Choose one of the listed options.';

  if (values.message.length > MESSAGE_MAX) {
    errors.message = `Keep the message under ${MESSAGE_MAX.toLocaleString('en-GB')} characters.`;
  }

  return { ok: Object.keys(errors).length === 0, errors, values };
}
