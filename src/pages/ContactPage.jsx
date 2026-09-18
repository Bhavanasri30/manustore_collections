export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl pb-10">
      <div className="rounded-[30px] border border-[#eadbc7] bg-white p-6 shadow-lg shadow-[#5b1f2d]/5">
        <h1 className="section-title">Contact us</h1>
        <div className="space-y-5 text-[#5d4c4d]">
          <p>Reach out for product enquiries, styling suggestions, and order assistance.</p>
          <div className="rounded-2xl bg-[#fffdfb] p-4">
            <span className="font-semibold text-[#38131d]">WhatsApp:</span>{' '}
            <a href="https://wa.me/9989824277" target="_blank" rel="noreferrer" className="text-[#5b1f2d] underline">
              +91 9989824277
            </a>
          </div>
          <div className="rounded-2xl bg-[#fffdfb] p-4">
            <span className="font-semibold text-[#38131d]">Instagram:</span>{' '}
            <a href="https://www.instagram.com/manu_stores25/" target="_blank" rel="noreferrer" className="text-[#5b1f2d] underline">
              @manu_stores25
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
