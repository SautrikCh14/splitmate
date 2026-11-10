import { z } from 'zod';

// Icons are keys; the frontend maps each key to a picture.
export const GROUP_ICONS = ['users', 'plane', 'home', 'utensils', 'graduation-cap', 'heart', 'briefcase', 'shopping-bag'];

// Only currencies with two decimal places, because money is stored as whole minor units.
export const GROUP_CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'AED', 'SGD', 'AUD', 'CAD'];

const name = z
  .string('Enter a group name')
  .trim()
  .min(2, 'Group name must be at least 2 characters')
  .max(50, 'Group name is too long (50 characters maximum)');

const description = z
  .string('Description must be text')
  .trim()
  .max(200, 'Description is too long (200 characters maximum)')
  .transform((value) => (value === '' ? null : value))
  .nullable();

const icon = z.enum(GROUP_ICONS, 'Pick one of the available icons');
const currency = z.enum(GROUP_CURRENCIES, 'Choose a supported currency');

export const createGroupSchema = z.object({
  name,
  description: description.optional(),
  icon: icon.default('users'),
  currency: currency.default('INR'),
});

// The currency can never be changed after creation: there is no conversion,
// so switching it would silently change what every existing amount means.
export const updateGroupSchema = z
  .strictObject({
    name: name.optional(),
    description: description.optional(),
    icon: icon.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, 'Send at least one field to update');