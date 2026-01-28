import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import * as z from 'zod'

import { useAppForm } from '@/hooks/form'
import { getCurrentUser } from '@/lib/queries'
import { updateUserProfile, changePassword } from '@/lib/mutations'

import { Heading, Subheading } from '@/components/ui/heading'
import { Button } from '@/components/ui/button'
import { Field, Label } from '@/components/ui/fieldset'
import { Select } from '@/components/ui/select'

export const Route = createFileRoute('/profile')({
  loader: async () => {
    const user = await getCurrentUser()
    return { user }
  },
  component: Profile,
  head: () => ({
    meta: [
      { title: 'Profile Settings' },
      {
        name: 'description',
        content:
          'Update your profile settings including password, country, and flag.',
      },
    ],
  }),
})

const countries = [
  { name: 'United States', flag: '🇺🇸', code: 'US' },
  { name: 'United Kingdom', flag: '🇬🇧', code: 'GB' },
  { name: 'Germany', flag: '🇩🇪', code: 'DE' },
  { name: 'France', flag: '🇫🇷', code: 'FR' },
  { name: 'Spain', flag: '🇪🇸', code: 'ES' },
  { name: 'Italy', flag: '🇮🇹', code: 'IT' },
  { name: 'Portugal', flag: '🇵🇹', code: 'PT' },
  { name: 'Netherlands', flag: '🇳🇱', code: 'NL' },
  { name: 'Belgium', flag: '🇧🇪', code: 'BE' },
  { name: 'Brazil', flag: '🇧🇷', code: 'BR' },
  { name: 'Argentina', flag: '🇦🇷', code: 'AR' },
  { name: 'Mexico', flag: '🇲🇽', code: 'MX' },
  { name: 'Canada', flag: '🇨🇦', code: 'CA' },
  { name: 'Australia', flag: '🇦🇺', code: 'AU' },
  { name: 'Japan', flag: '🇯🇵', code: 'JP' },
  { name: 'South Korea', flag: '🇰🇷', code: 'KR' },
  { name: 'China', flag: '🇨🇳', code: 'CN' },
  { name: 'India', flag: '🇮🇳', code: 'IN' },
  { name: 'Russia', flag: '🇷🇺', code: 'RU' },
  { name: 'Sweden', flag: '🇸🇪', code: 'SE' },
  { name: 'Norway', flag: '🇳🇴', code: 'NO' },
  { name: 'Denmark', flag: '🇩🇰', code: 'DK' },
  { name: 'Finland', flag: '🇫🇮', code: 'FI' },
  { name: 'Poland', flag: '🇵🇱', code: 'PL' },
  { name: 'Czech Republic', flag: '🇨🇿', code: 'CZ' },
  { name: 'Austria', flag: '🇦🇹', code: 'AT' },
  { name: 'Switzerland', flag: '🇨🇭', code: 'CH' },
  { name: 'Greece', flag: '🇬🇷', code: 'GR' },
  { name: 'Turkey', flag: '🇹🇷', code: 'TR' },
  { name: 'Egypt', flag: '🇪🇬', code: 'EG' },
  { name: 'South Africa', flag: '🇿🇦', code: 'ZA' },
  { name: 'Nigeria', flag: '🇳🇬', code: 'NG' },
  { name: 'Morocco', flag: '🇲🇦', code: 'MA' },
  { name: 'Ghana', flag: '🇬🇭', code: 'GH' },
  { name: 'Ivory Coast', flag: '🇨🇮', code: 'CI' },
  { name: 'Cameroon', flag: '🇨🇲', code: 'CM' },
  { name: 'Senegal', flag: '🇸🇳', code: 'SN' },
  { name: 'Tunisia', flag: '🇹🇳', code: 'TN' },
  { name: 'Algeria', flag: '🇩🇿', code: 'DZ' },
]

const profileSchema = z.object({
  country: z.string(),
})

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(6, 'New password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

function Profile() {
  const { user } = Route.useLoaderData()
  const [profileMessage, setProfileMessage] = useState<{
    success: boolean
    text: string
  } | null>(null)
  const [passwordMessage, setPasswordMessage] = useState<{
    success: boolean
    text: string
  } | null>(null)

  const profileForm = useAppForm({
    defaultValues: {
      country: user.country || '',
    },
    validators: {
      onChange: profileSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const selectedCountry = countries.find((c) => c.name === value.country)
        await updateUserProfile({
          data: {
            updates: {
              country: value.country || null,
              countryFlag: selectedCountry?.flag || null,
            },
          },
        })
        setProfileMessage({
          success: true,
          text: 'Profile updated successfully!',
        })
      } catch {
        setProfileMessage({
          success: false,
          text: 'Failed to update profile. Please try again.',
        })
      }
    },
  })

  const passwordForm = useAppForm({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validators: {
      onChange: passwordSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await changePassword({
          data: {
            currentPassword: value.currentPassword,
            newPassword: value.newPassword,
          },
        })
        setPasswordMessage({
          success: true,
          text: 'Password changed successfully!',
        })
        passwordForm.reset()
      } catch {
        setPasswordMessage({
          success: false,
          text: 'Failed to change password. Please check your current password.',
        })
      }
    },
  })

  const selectedCountry = countries.find(
    (c) => c.name === profileForm.state.values.country,
  )

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <Heading level={1}>Profile Settings</Heading>

      {profileMessage && (
        <div
          className={`rounded-lg p-4 ${profileMessage.success ? 'bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200' : 'bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200'}`}
        >
          {profileMessage.text}
        </div>
      )}

      {/* Profile Information */}
      <div className="rounded-lg bg-white p-6 shadow dark:bg-zinc-900">
        <Heading level={2}>Profile Information</Heading>
        <Subheading level={6}>Update your country and flag</Subheading>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            profileForm.handleSubmit()
          }}
          className="mt-6 space-y-6"
        >
          <profileForm.AppField
            name="country"
            children={(field) => (
              <Field>
                <Label>Country</Label>
                <Select
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                >
                  <option value="">Select a country...</option>
                  {countries.map((country) => (
                    <option key={country.code} value={country.name}>
                      {country.flag} {country.name}
                    </option>
                  ))}
                </Select>
              </Field>
            )}
          />

          <Field>
            <Label>Flag (auto-selected based on country)</Label>
            <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-3 dark:bg-zinc-800">
              <span className="text-2xl">{selectedCountry?.flag || '🏳️'}</span>
              <span className="text-gray-600 dark:text-gray-400">
                {selectedCountry?.name || 'No country selected'}
              </span>
            </div>
          </Field>

          <profileForm.AppForm>
            <profileForm.SubmitButton label="Update Profile" />
          </profileForm.AppForm>
        </form>
      </div>

      {passwordMessage && (
        <div
          className={`rounded-lg p-4 ${passwordMessage.success ? 'bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200' : 'bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200'}`}
        >
          {passwordMessage.text}
        </div>
      )}

      {/* Password Change */}
      <div className="rounded-lg bg-white p-6 shadow dark:bg-zinc-900">
        <Heading level={2}>Change Password</Heading>
        <Subheading level={6}>Update your account password</Subheading>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            passwordForm.handleSubmit()
          }}
          className="mt-6 space-y-6"
        >
          <passwordForm.AppField
            name="currentPassword"
            children={(field) => (
              <field.TextField label="Current Password" type="password" />
            )}
          />

          <passwordForm.AppField
            name="newPassword"
            children={(field) => (
              <field.TextField label="New Password" type="password" />
            )}
          />

          <passwordForm.AppField
            name="confirmPassword"
            children={(field) => (
              <field.TextField label="Confirm New Password" type="password" />
            )}
          />

          <passwordForm.AppForm>
            <passwordForm.SubmitButton label="Change Password" />
          </passwordForm.AppForm>
        </form>
      </div>
    </div>
  )
}
