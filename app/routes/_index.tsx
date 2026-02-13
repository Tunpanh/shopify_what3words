import { Link } from "@remix-run/react";

export default function Index() {
  return (
    <main style={{ fontFamily: "Arial, sans-serif", margin: "2rem", lineHeight: 1.4 }}>
      <h1>Shopify App Scaffold</h1>
      <p>Base project scaffold is ready for the what3words implementation plan.</p>
      <p>
        Next planned feature route: <Link to="/app/settings">/app/settings</Link>
      </p>
    </main>
  );
}

