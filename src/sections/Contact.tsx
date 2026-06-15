import { useState, useRef, useCallback } from 'react';
import { Send, Mail, MapPin, Clock, ArrowRight, Github, Linkedin, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';
import Section from '../components/Section';
import { useSupabaseData } from '../hooks/usePortfolioData';
import { loadContactInfo } from '../lib/loaders';
import { submitContactForm } from '../lib/supabase';

const WEB3FORMS_ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || '';
const WEB3FORMS_URL = 'https://api.web3forms.com/submit';

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

const MAX_LENGTH = 2000;

function validateForm(data: { name: string; email: string; subject: string; message: string }): FormErrors {
  const errors: FormErrors = {};

  if (!data.name.trim()) {
    errors.name = 'Please enter your name';
  } else if (data.name.length > 100) {
    errors.name = 'Name must be under 100 characters';
  }

  if (!data.email.trim()) {
    errors.email = 'Please enter your email address';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Please enter a valid email address';
  } else if (data.email.length > 254) {
    errors.email = 'Email must be under 254 characters';
  }

  if (!data.subject.trim()) {
    errors.subject = 'Please enter a subject';
  } else if (data.subject.length > 200) {
    errors.subject = 'Subject must be under 200 characters';
  }

  if (!data.message.trim()) {
    errors.message = 'Please enter your message';
  } else if (data.message.length > MAX_LENGTH) {
    errors.message = `Message must be under ${MAX_LENGTH.toLocaleString()} characters`;
  }

  return errors;
}

export default function Contact() {
  const { data: contactInfoData } = useSupabaseData(loadContactInfo);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const formRef = useRef<HTMLFormElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const handleChange = useCallback((field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (submitStatus !== 'idle') {
      setSubmitStatus('idle');
    }
  }, [errors, submitStatus]);
  if (!contactInfoData) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const validationErrors = validateForm(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      const firstErrorField = Object.keys(validationErrors)[0] as keyof FormErrors;
      if (firstErrorField === 'name') nameRef.current?.focus();
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const formPayload = {
        access_key: WEB3FORMS_ACCESS_KEY,
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
      };

      const res = await fetch(WEB3FORMS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formPayload),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to send message');
      }

      setSubmitStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setErrors({});
      submitContactForm({ name: formData.name, email: formData.email, subject: formData.subject, message: formData.message });
    } catch {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      label: 'Email',
      value: contactInfoData.email,
      href: `mailto:${contactInfoData.email}`,
    },
    {
      icon: MapPin,
      label: 'Location',
      value: contactInfoData.location,
    },
    {
      icon: Clock,
      label: 'Response Time',
      value: 'Usually within 24 hours',
    },
  ];

  return (
    <Section id="contact" className="bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-dark-900 dark:via-dark-800 dark:to-dark-900">
      <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-200 dark:border-violet-800/30 mb-6">
            <Sparkles className="w-4 h-4 text-violet-500" />
            <span className="text-sm font-medium text-violet-600 dark:text-violet-400">
              Let's Connect
            </span>
          </div>

          <h2 className="text-4xl sm:text-5xl font-bold text-theme-primary mb-6 tracking-tight">
            Let's{' '}
            <span className="bg-gradient-to-r from-violet-600 to-purple-500 bg-clip-text text-transparent">
              Connect
            </span>
            <br />
            and Collaborate
          </h2>

          <p className="text-lg text-theme-muted mb-12 leading-relaxed max-w-lg">
            Have a question about biomedical engineering, healthcare technology, or collaboration opportunities?
            Feel free to reach out — I'd love to hear from you.
          </p>

          <div className="space-y-6 mb-12">
            {contactInfo.map((item) => (
              <div key={item.label} className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <item.icon className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <p className="text-sm text-theme-muted">{item.label}</p>
                  {item.href ? (
                    <a
                      href={item.href}
                      aria-label="Send Email"
                      className="text-theme-primary font-medium hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                    >
                      {item.value}
                    </a>
                  ) : (
                    <p className="text-theme-primary font-medium">{item.value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4">
              <a
                href={contactInfoData.github}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-700 hover:scale-110 transition-all duration-300 hover:shadow-lg"
                aria-label="GitHub Profile"
              >
              <Github className="w-5 h-5 text-theme-secondary" />
            </a>
              <a
                href={contactInfoData.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-700 hover:scale-110 transition-all duration-300 hover:shadow-lg"
                aria-label="LinkedIn Profile"
              >
              <Linkedin className="w-5 h-5 text-theme-secondary" />
            </a>
          </div>
        </div>

        <div>
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            noValidate
            className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800 shadow-xl"
            aria-label="Contact form"
          >
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-theme-primary mb-2">
                Send a Message
              </h3>
              <p className="text-theme-muted">
                I'll get back to you as soon as possible.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-theme-secondary mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  ref={nameRef}
                  type="text"
                  id="name"
                  autoComplete="name"
                  required
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? 'name-error' : undefined}
                  className={`w-full px-4 py-3.5 rounded-2xl bg-gray-50 dark:bg-slate-800 border-2 outline-none transition-all duration-200 text-theme-primary placeholder:text-theme-muted focus:ring-4 focus:ring-violet-500/20 ${
                    errors.name
                      ? 'border-red-400 dark:border-red-500'
                      : 'border-gray-200 dark:border-slate-700 focus:border-violet-500 dark:focus:border-violet-500'
                  }`}
                />
                {errors.name && (
                  <p id="name-error" className="mt-1.5 text-sm text-red-500 flex items-center gap-1" role="alert">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-theme-secondary mb-1.5">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  autoComplete="email"
                  required
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  className={`w-full px-4 py-3.5 rounded-2xl bg-gray-50 dark:bg-slate-800 border-2 outline-none transition-all duration-200 text-theme-primary placeholder:text-theme-muted focus:ring-4 focus:ring-violet-500/20 ${
                    errors.email
                      ? 'border-red-400 dark:border-red-500'
                      : 'border-gray-200 dark:border-slate-700 focus:border-violet-500 dark:focus:border-violet-500'
                  }`}
                />
                {errors.email && (
                  <p id="email-error" className="mt-1.5 text-sm text-red-500 flex items-center gap-1" role="alert">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-theme-secondary mb-1.5">
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="subject"
                  autoComplete="off"
                  required
                  placeholder="Collaboration Opportunity"
                  value={formData.subject}
                  onChange={(e) => handleChange('subject', e.target.value)}
                  aria-invalid={!!errors.subject}
                  aria-describedby={errors.subject ? 'subject-error' : undefined}
                  className={`w-full px-4 py-3.5 rounded-2xl bg-gray-50 dark:bg-slate-800 border-2 outline-none transition-all duration-200 text-theme-primary placeholder:text-theme-muted focus:ring-4 focus:ring-violet-500/20 ${
                    errors.subject
                      ? 'border-red-400 dark:border-red-500'
                      : 'border-gray-200 dark:border-slate-700 focus:border-violet-500 dark:focus:border-violet-500'
                  }`}
                />
                {errors.subject && (
                  <p id="subject-error" className="mt-1.5 text-sm text-red-500 flex items-center gap-1" role="alert">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    {errors.subject}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-theme-secondary mb-1.5">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  required
                  placeholder="Tell me about your project or inquiry..."
                  rows={5}
                  value={formData.message}
                  onChange={(e) => handleChange('message', e.target.value)}
                  aria-invalid={!!errors.message}
                  aria-describedby={errors.message ? 'message-error' : undefined}
                  className={`w-full px-4 py-3.5 rounded-2xl bg-gray-50 dark:bg-slate-800 border-2 outline-none transition-all duration-200 text-theme-primary placeholder:text-theme-muted resize-none focus:ring-4 focus:ring-violet-500/20 ${
                    errors.message
                      ? 'border-red-400 dark:border-red-500'
                      : 'border-gray-200 dark:border-slate-700 focus:border-violet-500 dark:focus:border-violet-500'
                  }`}
                />
                <div className="flex items-center justify-between mt-1.5">
                  {errors.message && (
                    <p id="message-error" className="text-sm text-red-500 flex items-center gap-1" role="alert">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      {errors.message}
                    </p>
                  )}
                  <p className={`text-xs ml-auto ${formData.message.length > MAX_LENGTH ? 'text-red-500' : 'text-theme-muted'}`}>
                    {formData.message.length.toLocaleString()} / {MAX_LENGTH.toLocaleString()}
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full group relative inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-semibold text-white bg-gray-900 dark:bg-white dark:text-gray-900 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 focus:outline-none focus:ring-4 focus:ring-gray-900/30 dark:focus:ring-white/30"
                aria-busy={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Message
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              {submitStatus === 'success' && (
                <div
                  className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/30 animate-in"
                  role="alert"
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-emerald-800 dark:text-emerald-200 font-semibold mb-1">
                        Message Sent Successfully
                      </p>
                      <p className="text-emerald-600 dark:text-emerald-300 text-sm">
                        Thank you for your message. I will get back to you as soon as possible.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {submitStatus === 'error' && (
                <div
                  className="p-5 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30"
                  role="alert"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-red-500 text-lg font-bold">!</span>
                    </div>
                    <div>
                      <p className="text-red-800 dark:text-red-200 font-semibold mb-1">
                        Unable to send message.
                      </p>
                      <p className="text-red-600 dark:text-red-300 text-sm">
                        Please try again later.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </Section>
  );
}
