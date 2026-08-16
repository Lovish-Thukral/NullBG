export default function PrivacyTermsSection() {
  return (
    <section
      id="privacy-terms"
      className="scroll-mt-24 mx-auto max-w-7xl px-6 py-20 md:px-10 lg:px-16"
    >
      <div className="rounded-[2rem] border border-[#cb2957]/20 bg-[#0a0a0a]/75 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.5)] backdrop-blur-xl md:p-10">
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.26em] text-[#cb2957]">
          Privacy & Terms
        </p>
        <h2 className="text-3xl font-black text-white md:text-5xl">
          Privacy policy and terms of service.
        </h2>

        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <div className="rounded-[1.5rem] border border-[#dddddd]/10 bg-[#111111]/70 p-6">
            <h3 className="mb-4 text-2xl font-bold text-white">Privacy Policy</h3>
            <div className="space-y-5 text-[#d9d9d9]">
              <p>
                NullBG processes images locally in your browser. We do not upload your photos to an external server for background removal.
              </p>

              <div>
                <h4 className="mb-2 text-lg font-semibold text-[#eeeeee]">What we collect</h4>
                <p>
                  We do not store your uploaded images on our servers. Images are used only for the current editing session in your browser and may remain in temporary memory until the tab is closed or you clear the session.
                </p>
              </div>

              <div>
                <h4 className="mb-2 text-lg font-semibold text-[#eeeeee]">How we use data</h4>
                <p>
                  We use local browser processing to remove backgrounds and provide the editing experience. We do not sell, share, or monetize your personal image data.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-[#dddddd]/10 bg-[#111111]/70 p-6">
            <h3 className="mb-4 text-2xl font-bold text-white">Terms of Service</h3>
            <div className="space-y-5 text-[#d9d9d9]">
              <p>
                By using NullBG, you agree to use the service responsibly and only for lawful purposes.
              </p>

              <div>
                <h4 className="mb-2 text-lg font-semibold text-[#eeeeee]">Service availability</h4>
                <p>
                  We work to keep the service available and reliable, but cannot guarantee uninterrupted access, performance, or compatibility across every browser or device.
                </p>
              </div>

              <div>
                <h4 className="mb-2 text-lg font-semibold text-[#eeeeee]">User responsibility</h4>
                <p>
                  You are responsible for the content you upload, the rights you have to use it, and any consequences of downloading or sharing the processed output.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
