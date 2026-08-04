import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import axios from 'axios'
import {
  FiPhone,
  FiMail,
  FiMapPin,
  FiClock,
  FiChevronDown,
  FiSend,
  FiCheckCircle,
  FiHelpCircle,
  FiMessageSquare,
} from 'react-icons/fi'
import UserWrapper from "@/Wrapper/UserWrapper";

const FAQS = [
  {
    question: 'How do I reschedule or cancel a driving lesson?',
    answer:
      "Head to My Bookings, select the lesson you'd like to change, then choose Reschedule or Cancel. Changes made more than 24 hours before your lesson won't incur a fee.",
  },
  {
    question: 'What do I need to bring to my first lesson?',
    answer:
      'Please bring your current Learner or Provisional licence, comfortable closed-toe shoes, and glasses or contacts if you need them for driving.',
  },
  {
    question: 'How do I book a driving test through Wheelmaster?',
    answer:
      "Go to Book a Lesson and select 'Driving Test' as the package type. You'll be able to choose a test location and available time slot near you.",
  },
  {
    question: 'What are your payment and refund policies?',
    answer:
      'Payments are processed securely and appear under Payments in your dashboard. Refunds for cancellations made in line with our policy are returned to your original payment method within 3–5 business days.',
  },
  {
    question: 'Which areas does Wheelmaster Driving Academy cover?',
    answer:
      'We currently operate across Australia, with instructors available in most major metro and regional areas. Coverage is confirmed at the time of booking based on your pickup location.',
  },
]

const SUBJECT_OPTIONS = [
  'Booking & Scheduling',
  'Payments & Refunds',
  'Instructor Feedback',
  'Account & Login',
  'Other',
]

const Support = () => {
  const [openFaq, setOpenFaq] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      subject: SUBJECT_OPTIONS[0],
      message: '',
    },
  })

  const toggleFaq = (index) => {
    setOpenFaq((prev) => (prev === index ? null : index))
  }

  const onSubmit = async (data) => {
    setSubmitting(true)
    setErrorMsg('')
    try {
      await axios.post(route('support.store'), data)
      setSubmitted(true)
      reset()
      setTimeout(() => setSubmitted(false), 5000)
    } catch (err) {
      setErrorMsg(
        err?.response?.data?.message ||
          'Something went wrong while sending your message. Please try again.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <UserWrapper title="Support" description="Get help and support from Wheelmaster Driving Academy">
      <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Support</h1>
          <p className="mt-1 text-sm text-gray-500">
            We're here to help. Reach the Wheelmaster Driving Academy team or browse
            answers to common questions below.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contact info cards */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-blue-50 text-blue-600">
                  <FiPhone className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Call us</p>
                  <a
                    href="tel:0481488216"
                    className="text-sm text-gray-500 hover:text-blue-600"
                  >
                    0481 488 216
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-blue-50 text-blue-600">
                  <FiMail className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Email us</p>
                  <a
                    href="mailto:Wheelmaster@outlook.com.au"
                    className="text-sm text-gray-500 hover:text-blue-600"
                  >
                    Wheelmaster@outlook.com.au
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-blue-50 text-blue-600">
                  <FiMapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Office</p>
                  <p className="text-sm text-gray-500">
                    Mandurah, WA, Australia
                    {/* <br />
                    Melbourne VIC 3000, Australia */}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-blue-50 text-blue-600">
                  <FiClock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Support hours</p>
                  <p className="text-sm text-gray-500">
                    Mon–Fri, 8:00 AM – 6:00 PM AEST
                    <br />
                    Sat, 9:00 AM – 1:00 PM AEST
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact form + FAQ */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact form */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <FiMessageSquare className="h-5 w-5 text-blue-600" />
                <h2 className="text-base font-semibold text-gray-900">
                  Send us a message
                </h2>
              </div>

              {submitted && (
                <div className="mb-4 flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
                  <FiCheckCircle className="h-5 w-5 flex-shrink-0" />
                  Thanks — your message has been sent. Our team will get back to you
                  shortly.
                </div>
              )}

              {errorMsg && (
                <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                  </label>
                  <select
                    {...register('subject', { required: 'Please select a subject' })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {SUBJECT_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  {errors.subject && (
                    <p className="mt-1 text-xs text-red-600">{errors.subject.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <textarea
                    rows={5}
                    placeholder="Tell us what's going on and we'll help sort it out..."
                    {...register('message', {
                      required: 'Please enter a message',
                      minLength: {
                        value: 10,
                        message: 'Please provide a few more details',
                      },
                    })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.message && (
                    <p className="mt-1 text-xs text-red-600">{errors.message.message}</p>
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                  >
                    <FiSend className="h-4 w-4" />
                    {submitting ? 'Sending...' : 'Send message'}
                  </button>
                </div>
              </form>
            </div>

            {/* FAQ */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <FiHelpCircle className="h-5 w-5 text-blue-600" />
                <h2 className="text-base font-semibold text-gray-900">
                  Frequently asked questions
                </h2>
              </div>

              <div className="divide-y divide-gray-100">
                {FAQS.map((faq, index) => (
                  <div key={faq.question} className="py-3">
                    <button
                      type="button"
                      onClick={() => toggleFaq(index)}
                      className="w-full flex items-center justify-between text-left"
                    >
                      <span className="text-sm font-medium text-gray-900">
                        {faq.question}
                      </span>
                      <FiChevronDown
                        className={`h-4 w-4 text-gray-400 transition-transform flex-shrink-0 ml-3 ${
                          openFaq === index ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {openFaq === index && (
                      <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                        {faq.answer}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </UserWrapper>
  )
}

export default Support