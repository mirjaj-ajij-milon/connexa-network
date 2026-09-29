import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <title>Connexa | Professional Network</title>
        <meta name="description" content="Connexa - Connect, Share, and Grow Professionally" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
        <div className="max-w-2xl w-full text-center space-y-6 bg-slate-900/60 backdrop-blur-md border border-slate-800 p-8 rounded-2xl shadow-xl">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 text-2xl font-bold">
            C
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent sm:text-4xl">
            Connexa Network
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Backend API & Frontend Tailwind CSS configured cleanly. Ready for component & page development.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <span className="px-3 py-1 text-xs font-medium rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              Next.js 16
            </span>
            <span className="px-3 py-1 text-xs font-medium rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              Tailwind CSS v4
            </span>
            <span className="px-3 py-1 text-xs font-medium rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              RESTful API Connected
            </span>
          </div>
        </div>
      </main>
    </>
  );
}
