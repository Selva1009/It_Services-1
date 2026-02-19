"use client";
import { API_BASE_URL } from "@/lib/api/config";
import { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Clock,
  User,
  MessageSquare,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  const [isSubmitted, setIsSubmitted] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/support/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        setIsSubmitted(true);
        showSuccessAlert();
        reset();
      } else {
        showErrorAlert(result.message);
      }
    } catch (error) {
      showErrorAlert("Please try again later.");
    }

    setLoading(false);
  };

  const showSuccessAlert = () => {
    Swal.fire({
      title: "Message Sent!",
      text: "We will get back to you within 24 hours",
      icon: "success",
      confirmButtonText: "Great!",
      customClass: {
        container: "rounded-xl",
        popup: "rounded-2xl border border-gray-200 shadow-2xl",
        confirmButton:
          "bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 px-6 py-2 rounded-full text-white",
      },
      background: "#fff",
      showClass: {
        popup: "animate_animated animate_fadeInDown",
      },
      hideClass: {
        popup: "animate_animated animate_fadeOutUp",
      },
    });
  };

  const showErrorAlert = (message) => {
    Swal.fire({
      icon: "error",
      title: "Oops!",
      text: message,
      confirmButtonText: "Try Again",
      customClass: {
        confirmButton:
          "bg-red-500 hover:bg-red-600 px-4 py-2 rounded-full text-white",
      },
    });
  };

  return (
    <section
      id="ContactSection"
      className="bg-gradient-to-br from-gray-50 to-blue-50 py-20 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl -mt-6 font-[Inter] mx-auto">
        {/* Section Header */ }
        <motion.div
          initial={ { opacity: 0, y: 20 } }
          whileInView={ { opacity: 1, y: 0 } }
          transition={ { duration: 0.5 } }
          viewport={ { once: true } }
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Get in Touch
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Have questions or want to discuss a project? Reach out to our team -
            we&apos;re here to help!
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Contact Information */ }
          <motion.div
            initial={ { opacity: 0, x: -20 } }
            whileInView={ { opacity: 1, x: 0 } }
            transition={ { duration: 0.5, delay: 0.2 } }
            viewport={ { once: true } }
            className="space-y-8"
          >
            {/* Contact Cards */ }
            <div className="space-y-14">
              <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                    <Mail size={ 24 } />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      Email Us
                    </h3>
                    <p className="text-gray-600 mt-1">info@teckost.com</p>
                    <a
                      href="mailto:info@teckost.com"
                      className="inline-block mt-2 text-blue-500 hover:text-blue-700 text-sm font-medium"
                    >
                      Send us an email
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-green-100 rounded-lg text-green-600">
                    <Phone size={ 24 } />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      Call Us
                    </h3>
                    <p className="text-gray-600 mt-1">(044) 477-03399</p>
                    <a
                      href="tel:+04447703399"
                      className="inline-block mt-2 text-blue-500 hover:text-blue-700 text-sm font-medium"
                    >
                      Call now
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-purple-100 rounded-lg text-purple-600">
                    <MapPin size={ 24 } />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      Visit Us
                    </h3>
                    <p className="text-gray-600 mt-1">
                      53, North Boag Road, Fourth Floor, Mandira Block B,
                      <br />
                      Behind Residency Towers,
                      <br />
                      Chennai, Tamil Nadu 600017
                    </p>
                    <a
                      href="https://maps.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-2 text-blue-500 hover:text-blue-700 text-sm font-medium"
                    >
                      Get directions
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */ }
          <motion.div
            initial={ { opacity: 0, x: 20 } }
            whileInView={ { opacity: 1, x: 0 } }
            transition={ { duration: 0.5, delay: 0.2 } }
            viewport={ { once: true } }
            className="bg-white p-8 rounded-3xl shadow-xl border border-gray-200"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Send us a message
            </h3>
            <p className="text-gray-600 mb-6">
              Fill out the form below and we&apos;ll get back to you soon
            </p>

            <form onSubmit={ handleSubmit(onSubmit) } className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Your Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="name"
                    type="text"
                    { ...register("name", { required: "Name is required" }) }
                    className="pl-10 w-full py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="John Doe"
                  />
                </div>
                { errors.name && (
                  <p className="mt-1 text-sm text-red-600">
                    { errors.name.message }
                  </p>
                ) }
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    { ...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address",
                      },
                    }) }
                    className="pl-10 w-full py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="your@email.com"
                  />
                </div>
                { errors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    { errors.email.message }
                  </p>
                ) }
              </div>

              <div>
                <label
                  htmlFor="comment"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Your Message <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute top-3 left-3">
                    <MessageSquare className="h-5 w-5 text-gray-400" />
                  </div>
                  <Textarea
                    id="comment"
                    { ...register("comment", {
                      required: "Message is required",
                      minLength: {
                        value: 10,
                        message: "Message must be at least 10 characters",
                      },
                    }) }
                    className="pl-10 w-full py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[130px]"
                    placeholder="How can we help you?"
                  />
                </div>
                { errors.comment && (
                  <p className="mt-1 text-sm text-red-600">
                    { errors.comment.message }
                  </p>
                ) }
              </div>

              <div className="pt-2">

                <div className="flex justify-center">
                  <Button
                    type="submit"
                    disabled={ loading }
                    className="w-1/2  py-3 px-6 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                  >


                    { loading ? (
                      <span className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Sending...
                      </span>
                    ) : (
                      "Send Message"
                    ) }
                  </Button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
