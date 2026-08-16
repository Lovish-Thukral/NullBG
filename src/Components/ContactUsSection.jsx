import { motion } from "framer-motion";

const helpTopics = [
  {
    title: "General Question",
    description:
      "Need help using the background remover, downloading your images, or understanding how something works?",
  },
  {
    title: "Technical Issue",
    description:
      "Something isn’t working correctly? Tell us what happened and, when possible, include the browser and device you’re using.",
  },
  {
    title: "Feedback / Suggestion",
    description:
      "Have an idea that could make the product better? We’d like to hear it.",
  },
  {
    title: "Report a Problem",
    description:
      "Found an image that wasn’t processed correctly or noticed something broken? Let us know so we can investigate.",
  },
  {
    title: "Business / Partnership",
    description:
      "Interested in working with us, integrating the technology, or discussing a business opportunity?",
  },
];

// Framer Motion Animation Variants
const headerVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // Staggers the appearance of the help topic cards
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const formVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: "easeOut", delay: 0.2 },
  },
};

export default function ContactUsSection() {
  return (
    <section
      id="contact-us"
      className="w-full scroll-mt-24 px-6 py-20 md:px-12 md:py-28 lg:px-20 xl:px-32 2xl:px-40"
    >
      <div className="mx-auto w-full max-w-[1500px]">
        {/* Header Section */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={headerVariants}
          className="mb-12 max-w-3xl md:mb-16 lg:mb-20"
        >
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-[#cb2957] sm:text-sm">
            Contact Us
          </p>
          <h2 className="text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
            Let’s Talk
          </h2>
          <p className="mt-6 text-base leading-relaxed text-[#d8d8d8] sm:text-lg lg:text-xl">
            Have a question, found a problem, or have a suggestion? We’re here
            to help.
          </p>
        </motion.div>

        {/* Content Grid */}
        <div className="grid gap-12 lg:grid-cols-[1fr_1.3fr] lg:gap-20 xl:gap-28">
          {/* Left Column: Help Topics */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={listVariants}
            className="flex flex-col space-y-4"
          >
            <h3 className="mb-2 text-xl font-bold text-white sm:text-2xl">
              How can we help?
            </h3>

            {helpTopics.map((item) => (
              <motion.div
                key={item.title}
                variants={itemVariants}
                className="group rounded-2xl border border-[#dddddd]/10 bg-[#0b0b0b]/60 p-5 backdrop-blur-md transition-all duration-300 hover:border-[#cb2957]/50 hover:bg-[#151515]"
              >
                <h4 className="text-base font-semibold text-[#eeeeee] transition-colors group-hover:text-[#cb2957]">
                  {item.title}
                </h4>
                <p className="mt-2 text-sm leading-relaxed text-[#d0d0d0]">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* Right Column: Form */}
          <motion.form
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={formVariants}
            className="rounded-[2rem] border border-[#cb2957]/20 bg-[#121212]/80 p-6 backdrop-blur-xl sm:p-8 lg:p-10"
          >
            <div className="grid gap-6 md:grid-cols-2">
              <label className="block text-sm font-medium text-[#eeeeee]">
                <span className="mb-2 block ml-1">Name</span>
                <input
                  type="text"
                  placeholder="Your name"
                  className="w-full rounded-xl border border-[#dddddd]/15 bg-[#0d0d0d] px-4 py-3.5 text-white outline-none transition-all placeholder:text-[#666] hover:border-[#dddddd]/30 focus:border-[#cb2957] focus:bg-[#111111] focus:ring-1 focus:ring-[#cb2957]/50"
                />
              </label>

              <label className="block text-sm font-medium text-[#eeeeee]">
                <span className="mb-2 block ml-1">Email</span>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-[#dddddd]/15 bg-[#0d0d0d] px-4 py-3.5 text-white outline-none transition-all placeholder:text-[#666] hover:border-[#dddddd]/30 focus:border-[#cb2957] focus:bg-[#111111] focus:ring-1 focus:ring-[#cb2957]/50"
                />
              </label>
            </div>

            <label className="mt-6 block text-sm font-medium text-[#eeeeee]">
              <span className="mb-2 block ml-1">Subject</span>
              <input
                type="text"
                placeholder="How can we help?"
                className="w-full rounded-xl border border-[#dddddd]/15 bg-[#0d0d0d] px-4 py-3.5 text-white outline-none transition-all placeholder:text-[#666] hover:border-[#dddddd]/30 focus:border-[#cb2957] focus:bg-[#111111] focus:ring-1 focus:ring-[#cb2957]/50"
              />
            </label>

            <label className="mt-6 block text-sm font-medium text-[#eeeeee]">
              <span className="mb-2 block ml-1">Message</span>
              <textarea
                rows="5"
                placeholder="Tell us more..."
                className="w-full resize-none rounded-xl border border-[#dddddd]/15 bg-[#0d0d0d] px-4 py-3.5 text-white outline-none transition-all placeholder:text-[#666] hover:border-[#dddddd]/30 focus:border-[#cb2957] focus:bg-[#111111] focus:ring-1 focus:ring-[#cb2957]/50"
              />
            </label>

            <div className="mt-8 flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
              <button
                type="button"
                className="rounded-full bg-[#cb2957] px-8 py-3.5 text-sm font-bold uppercase tracking-[0.18em] text-white transition-all hover:-translate-y-1 hover:shadow-[0_10px_30px_-10px_rgba(203,41,87,0.7)] active:translate-y-0"
              >
                Send Message
              </button>

              <p className="text-sm text-[#a0a0a0]">
                We aim to respond within 1–2 business days.
              </p>
            </div>
          </motion.form>
        </div>
      </div>
    </section>
  );
}
