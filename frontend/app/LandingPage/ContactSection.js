"use client";

import { API_BASE_URL } from "@/lib/api/config";
import { useState } from "react";
import { Mail, Phone, MapPin, User, MessageSquare } from "lucide-react";
import { useForm } from "react-hook-form";
import { Button, TextField, InputAdornment } from "@mui/material";
import Swal from "sweetalert2";
import { motion } from "framer-motion";

export default function ContactSection() {

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/support/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to send message.");
      }

      Swal.fire({
        title: "Message Sent",
        text: "We will get back to you within 24 hours.",
        icon: "success",
      });

      reset();

    } catch (error) {

      Swal.fire({
        icon: "error",
        title: "Request Failed",
        text: error.message || "Please try again later.",
      });

    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="ContactSection" className="lp-contact">
      <div className="lp-contact-container">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="lp-contact-head"
        >
          <h2>Get in Touch</h2>
          <p>Have questions or want to discuss a project? Reach out to our team.</p>
        </motion.div>


        <div className="lp-contact-grid">

          {/* Contact Cards */}

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="lp-contact-cards"
          >

            <article className="lp-contact-card">
              <span className="lp-contact-icon blue">
                <Mail size={22}/>
              </span>

              <div>
                <h3>Email Us</h3>
                <p>info@teckost.com</p>
                <a href="mailto:info@teckost.com">Send us an email</a>
              </div>
            </article>


            <article className="lp-contact-card">
              <span className="lp-contact-icon green">
                <Phone size={22}/>
              </span>

              <div>
                <h3>Call Us</h3>
                <p>(044) 477-03399</p>
                <a href="tel:+04447703399">Call now</a>
              </div>
            </article>


            <article className="lp-contact-card">
              <span className="lp-contact-icon indigo">
                <MapPin size={22}/>
              </span>

              <div>
                <h3>Visit Us</h3>

                <p>
                  53, North Boag Road, Fourth Floor, Mandira Block B,<br/>
                  Behind Residency Towers,<br/>
                  Chennai, Tamil Nadu 600017
                </p>

                <a href="https://maps.google.com" target="_blank">
                  Get directions
                </a>
              </div>

            </article>

          </motion.div>


          {/* Contact Form */}

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="lp-contact-form-wrap"
          >

            <h3>Send us a message</h3>
            <p>Fill out the form below and we'll get back to you soon.</p>


            <form onSubmit={handleSubmit(onSubmit)} className="lp-contact-form">

              {/* Name */}

              <TextField
                label="Your Name"
                fullWidth
                error={!!errors.name}
                helperText={errors.name?.message}
                {...register("name",{ required:"Name is required"})}

                InputProps={{
                  startAdornment:(
                    <InputAdornment position="start">
                      <User size={18}/>
                    </InputAdornment>
                  )
                }}
              />


              {/* Email */}

              <TextField
                label="Email Address"
                type="email"
                fullWidth
                error={!!errors.email}
                helperText={errors.email?.message}

                {...register("email",{
                  required:"Email is required",
                  pattern:{
                    value:/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message:"Invalid email address"
                  }
                })}

                InputProps={{
                  startAdornment:(
                    <InputAdornment position="start">
                      <Mail size={18}/>
                    </InputAdornment>
                  )
                }}
              />


              {/* Message */}

              <TextField
                label="Your Message"
                multiline
                rows={5}
                fullWidth
                error={!!errors.comment}
                helperText={errors.comment?.message}

                {...register("comment",{
                  required:"Message is required",
                  minLength:{
                    value:10,
                    message:"Message must be at least 10 characters"
                  }
                })}

                InputProps={{
                  startAdornment:(
                    <InputAdornment position="start">
                      <MessageSquare size={18}/>
                    </InputAdornment>
                  )
                }}
              />


              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                className="lp-submit-btn"
              >
                {loading ? "Sending..." : "Send Message"}
              </Button>

            </form>

          </motion.div>

        </div>

      </div>
    </section>
  );
}