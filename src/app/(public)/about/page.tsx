export default function AboutPage() {
  return (
    <div className="flex min-h-full w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-3xl space-y-6">
        <h1 className="text-3xl font-bold">About Personal Expense Tracker</h1>
        
        <div className="space-y-4 text-neutral-300">
          <p className="text-lg">
            A minimal and intuitive expense tracking application to help you manage
            your personal finances.
          </p>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold text-white">Features</h2>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Track income and expenses with detailed transactions</li>
              <li>Organize transactions by custom categories</li>
              <li>Manage debts - track what you owe and what is owed to you</li>
              <li>View financial summaries and insights on your dashboard</li>
              <li>Secure authentication to keep your data private</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold text-white">Getting Started</h2>
            <p>
              Create an account to start tracking your expenses. You can organize
              your transactions by categories, set up custom categories, and keep
              track of your debts all in one place.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold text-white">Privacy</h2>
            <p>
              Your financial data is stored securely and is only accessible to you.
              We use industry-standard encryption and authentication to protect your
              information.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
