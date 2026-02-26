import Image from "next/image";

export default function Home() {
  return (
    <section id="Home" className="lp-home">
      <div className="lp-home-title-wrap">
        <h1 className="lp-home-title">
          Struggling with C-Class IT Procurement? Let Us Handle It for You!
        </h1>
      </div>

      <div className="lp-home-grid">
        <div className="lp-home-image-wrap">
          <div className="lp-home-image-shell">
            <Image
              src="/c-class3.jpg"
              alt="C-Class IT Products"
              fill
              priority
              className="lp-home-image"
            />
          </div>
        </div>

        <div className="lp-home-copy">
          <h2>
            B2B IT Procurement for <span>C-Class & Select A/B-Class Items</span>
          </h2>

          <p>
            This platform specializes in sourcing <b>C-Class</b> IT products, along
            with low-volume A and B-class items such as Desktops, Laptops, Servers,
            entry-level Cisco Switches, Cisco Routers, basic Firewalls, and Wi-Fi
            Routers.
          </p>

          <p>
            We cater exclusively to B2B clients, and <b>GST registration</b> is
            mandatory for both our clients and IT suppliers. While we do not trade
            goods, we provide this as a <b>value-added service</b> rather than a
            revenue-focused offering.
          </p>

          <p>
            If clients need assistance in managing the{" "}
            <b>entire purchase order process</b>, including delivery follow-up, we
            offer this as an additional paid service.
          </p>
        </div>
      </div>
    </section>
  );
}
