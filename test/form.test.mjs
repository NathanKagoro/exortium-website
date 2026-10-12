import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateContact, isEmail, PURPOSES, MESSAGE_MAX } from '../src/js/lib/form.js';

const good = { name: 'Ada Example', email: 'ada@example.com', purpose: PURPOSES[0], message: '' };

test('a complete form passes', () => {
  const r = validateContact(good);
  assert.equal(r.ok, true);
  assert.deepEqual(r.errors, {});
});

test('values are trimmed and inner whitespace collapsed', () => {
  const r = validateContact({ ...good, name: '  Ada   Example ', email: ' ada@example.com ' });
  assert.equal(r.ok, true);
  assert.equal(r.values.name, 'Ada Example');
  assert.equal(r.values.email, 'ada@example.com');
});

test('an empty form reports the three required fields, in order', () => {
  const r = validateContact({});
  assert.equal(r.ok, false);
  assert.deepEqual(Object.keys(r.errors), ['name', 'email', 'purpose']);
});

test('missing input does not throw', () => {
  assert.equal(validateContact().ok, false);
  assert.equal(validateContact({ name: null, email: undefined }).ok, false);
});

test('name must be 2 to 80 characters', () => {
  assert.ok(validateContact({ ...good, name: 'A' }).errors.name);
  assert.ok(validateContact({ ...good, name: '   ' }).errors.name);
  assert.ok(validateContact({ ...good, name: 'x'.repeat(81) }).errors.name);
  assert.equal(validateContact({ ...good, name: 'x'.repeat(80) }).ok, true);
  assert.equal(validateContact({ ...good, name: 'Al' }).ok, true);
});

test('email addresses', () => {
  for (const ok of ['a@b.co', 'first.last@sub.example.org', 'o\'neil+tag@example.co.uk']) {
    assert.equal(isEmail(ok), true, ok);
  }
  for (const bad of ['', 'plain', '@example.com', 'a@b', 'a b@example.com', 'a@@example.com', 'a@example.', 'a@.com', 'a@example..com', `${'x'.repeat(250)}@a.co`]) {
    assert.equal(isEmail(bad), false, bad);
  }
  assert.ok(validateContact({ ...good, email: 'nope' }).errors.email);
});

test('purpose must be one of the listed options', () => {
  assert.ok(validateContact({ ...good, purpose: '' }).errors.purpose);
  assert.ok(validateContact({ ...good, purpose: 'Free pizza' }).errors.purpose);
  for (const p of PURPOSES) assert.equal(validateContact({ ...good, purpose: p }).ok, true);
});

test('message is optional but limited', () => {
  assert.equal(validateContact({ ...good, message: 'x'.repeat(MESSAGE_MAX) }).ok, true);
  const r = validateContact({ ...good, message: 'x'.repeat(MESSAGE_MAX + 1) });
  assert.equal(r.ok, false);
  assert.match(r.errors.message, /1,000/);
});

test('every error is a sentence a visitor can act on', () => {
  const r = validateContact({ name: 'A', email: 'x', purpose: 'y', message: 'z'.repeat(MESSAGE_MAX + 5) });
  for (const message of Object.values(r.errors)) assert.match(message, /^[A-Z].+\.$/);
  assert.equal(Object.keys(r.errors).length, 4);
});
