import React, { useState } from 'react';
import { toast } from 'react-toastify';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setSubmitted(true);
    toast.success('Thank you! Your message has been sent to the BatchBite team.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="py-5">
      <div className="container">
        <div className="text-center max-w-700 mx-auto mb-5">
          <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 px-3 py-1 rounded-pill fw-semibold mb-2">
            Get In Touch
          </span>
          <h1 className="fw-extrabold display-5">Contact & Support</h1>
          <p className="lead text-muted">
            Have questions about pre-orders, kitchen onboarding, or orders? We're here to assist.
          </p>
        </div>

        <div className="row g-5">
          {/* Contact Form */}
          <div className="col-lg-7">
            <div className="card p-4 p-md-5 border-0 shadow-sm rounded-4 bg-white">
              <h4 className="fw-bold mb-4">Send Us A Message</h4>
              {submitted && (
                <div className="alert alert-success alert-dismissible fade show mb-4" role="alert">
                  <i className="bi bi-check-circle-fill me-2"></i>
                  Message received! A team member will respond within 24 hours.
                </div>
              )}
              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Your Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      placeholder="e.g. Sarah Jenkins"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Email Address *</label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      placeholder="e.g. sarah@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-semibold">Subject</label>
                    <input
                      type="text"
                      className="form-control"
                      name="subject"
                      placeholder="How can we help?"
                      value={formData.subject}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-semibold">Your Message *</label>
                    <textarea
                      className="form-control"
                      rows="5"
                      name="message"
                      placeholder="Share your feedback, question, or inquiry..."
                      value={formData.message}
                      onChange={handleChange}
                      required
                    ></textarea>
                  </div>
                  <div className="col-12 mt-4">
                    <button type="submit" className="btn btn-bb-primary px-4 py-2">
                      <i className="bi bi-send me-2"></i> Send Message
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Contact Details & FAQs */}
          <div className="col-lg-5">
            <div className="card p-4 border-0 shadow-sm rounded-4 bg-white mb-4">
              <h5 className="fw-bold mb-3">Direct Channels</h5>
              <div className="d-flex align-items-center gap-3 mb-3">
                <div className="rounded-circle bg-danger bg-opacity-10 text-danger p-3">
                  <i className="bi bi-envelope fs-5"></i>
                </div>
                <div>
                  <small className="text-muted d-block">Support Email</small>
                  <strong>support@batchbite.com</strong>
                </div>
              </div>
              <div className="d-flex align-items-center gap-3 mb-3">
                <div className="rounded-circle bg-success bg-opacity-10 text-success p-3">
                  <i className="bi bi-headset fs-5"></i>
                </div>
                <div>
                  <small className="text-muted d-block">Chef Onboarding Hotline</small>
                  <strong>+1 (800) 555-BITE</strong>
                </div>
              </div>
              <div className="d-flex align-items-center gap-3">
                <div className="rounded-circle bg-warning bg-opacity-10 text-warning p-3">
                  <i className="bi bi-geo-alt fs-5 text-dark"></i>
                </div>
                <div>
                  <small className="text-muted d-block">Headquarters</small>
                  <strong>Artisan Way, Portland, OR</strong>
                </div>
              </div>
            </div>

            <div className="card p-4 border-0 shadow-sm rounded-4 bg-white">
              <h5 className="fw-bold mb-3">Frequently Asked Questions</h5>
              <div className="accordion accordion-flush" id="faqAccordion">
                <div className="accordion-item">
                  <h2 className="accordion-header" id="faq1">
                    <button
                      className="accordion-button collapsed px-0 fw-semibold"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#collapse1"
                    >
                      How do order deadlines work?
                    </button>
                  </h2>
                  <div id="collapse1" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                    <div className="accordion-body px-0 small text-muted">
                      Each batch has an order deadline set by the chef (usually 24–48 hours before prep date) so ingredients can be sourced fresh. Once the deadline passes, ordering closes.
                    </div>
                  </div>
                </div>

                <div className="accordion-item">
                  <h2 className="accordion-header" id="faq2">
                    <button
                      className="accordion-button collapsed px-0 fw-semibold"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#collapse2"
                    >
                      Can I cancel my pre-order?
                    </button>
                  </h2>
                  <div id="collapse2" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                    <div className="accordion-body px-0 small text-muted">
                      Yes! You can cancel orders in Pending or Confirmed status as long as the batch deadline has not passed. Your reserved items will be released back to the batch.
                    </div>
                  </div>
                </div>

                <div className="accordion-item">
                  <h2 className="accordion-header" id="faq3">
                    <button
                      className="accordion-button collapsed px-0 fw-semibold"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#collapse3"
                    >
                      How do I sell my food on BatchBite?
                    </button>
                  </h2>
                  <div id="collapse3" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                    <div className="accordion-body px-0 small text-muted">
                      Register as a Business Owner, configure your kitchen profile, upload your products, and publish your first scheduled batch!
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
