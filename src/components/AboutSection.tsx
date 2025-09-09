import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import Tilt from './Tilt';
import { Section } from './Section';
import effects from './CardEffects.module.css';

interface AboutLink {
  href: string;
  label: string;
}

const aboutLinks: AboutLink[] = [
  { href: '#education', label: 'Education' },
  { href: '#career', label: 'Career' },
  { href: '#art', label: 'Creative Coding' },
  { href: '#interests', label: 'Interests' },
  { href: '#oss', label: 'Open Source' },
];

interface AboutSectionProps {
  name: string;
  role: string;
  location: string;
}

export function AboutSection({ name, role, location }: AboutSectionProps) {
  return (
    <section id="about" className="mb-24">
      <div className="grid gap-12 md:grid-cols-3 items-start">
        <div className="md:col-span-1 space-y-6">
          {/* Profile Card */}
          <Tilt className="group relative overflow-hidden rounded-2xl p-6 bg-white/70 dark:bg-white/5 shadow-inner backdrop-blur-sm ring-1 ring-black/5 dark:ring-white/10" scale={1.03}>
            <span
              aria-hidden
              className={`pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${effects.shine}`}
            />
            <div className="flex flex-col items-center space-y-4">
              <div className="relative w-32 h-32 rounded-xl overflow-hidden ring-2 ring-black/5 dark:ring-white/10">
                <Image
                  src="/images/profile.png"
                  alt={name}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">
                  About
                </h2>
                <p className="text-base leading-relaxed text-gray-600 dark:text-gray-400">
                  {name} · {role} in {location}
                </p>
              </div>
            </div>
          </Tilt>

          {/* Navigation Links */}
          <div className="flex flex-col gap-2 text-base">
            {aboutLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="group inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
              >
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 will-change-transform" />
                {link.label}
              </a>
            ))}
          </div>
        </div>

        {/* Content Sections */}
        <div className="md:col-span-2 space-y-20">

          <Section id="education" title="Education" gradient="from-pink-500 via-orange-500 to-amber-400">
            <div className="w-full md:w-3/4 flow-root">
              {/* Book-style wrapped image */}
              <div className="hidden md:block float-right ml-6 mb-4">
                <Image
                  src="https://aovivo.ufrgs.br/static/img/ufrgs-chama.png"
                  alt={`${name} during PhD at UFRGS`}
                  width={200}
                  height={160}
                  className="rounded-lg ring-1 ring-black/5 dark:ring-white/10 object-cover"
                />
              </div>
              <p className="mb-2">
                I hold a PhD in Computer Science with Major in Machine Learning from UFRGS (Aug 2015 – Aug 2019).


                During my doctorate, I pursued research in <em>Geometric Deep Learning / Graph Neural Networks</em> and the
                <em> Ethics of Artificial Intelligence</em>, particularly <em>Machine Bias</em>.
              </p>
              <p className="mb-2">
                <a
                  href="https://www.csauthors.net/distance/marcelo-o-r-prates/paul-erdos"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                  aria-label="See detailed Erdős number path"
                >
                  My Erdős number is 3
                </a>, through Moshe Vardi.
              </p>
            </div>
          </Section>

          <Section id="career" title="Career" gradient="from-sky-500 to-indigo-500">
            <div className="w-full md:w-3/4">
              <p>
                I currently work as a Data Scientist and Machine Learning Engineer at Dataside, with previous
                experience as an AI researcher at Samsung R&amp;D Institute Brazil, where I led an innovative project for
                VO2Max estimation on wearable devices now shipped worldwide with the Samsung Galaxy Watch line. I also
                provide consultancy for companies interested on building solutions based on Machine Learning, Computer
                Vision or Large Language Models.
              </p>
              <ul className="mt-4 list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                <li>
                  Built LLM-powered RAG platforms (law and analytics) with multi-format ingestion and automated
                  workflows, significantly reducing manual workload and cost (Dataside).
                </li>
                <li>
                  Led production computer vision for 360° construction monitoring (semantic segmentation, analytics
                  dashboard), improving project tracking and decision-making (ConstructIN).
                </li>
                <li>
                  Drove ROI lifts in digital marketing by redesigning forecasting and real-time bid optimization
                  systems, with robust monitoring and MLOps (Condati).
                </li>
                <li>
                  Designed advanced forecasting with conformal prediction and quantile regression to control risk of
                  under/overestimation (Dataside).
                </li>
              </ul>
            </div>
          </Section>

          <Section id="art" title="Art & Creative Coding" gradient="from-fuchsia-500 to-rose-500">
            <div className="w-full md:w-3/4">
              <p className="mb-2">
                I have also been playing around with Generative art / Creative coding for some time now.
              </p>
              <p>
                I have also been experimenting with generative art (art created through programming) as a hobby since 2015. You can
                see some of my sketches in the Generative Art tab.
              </p>
            </div>
          </Section>

          <Section id="interests" title="Interests" gradient="from-emerald-500 to-teal-500">
            <div className="w-full md:w-3/4">
              <p>
                My main artistic interests include the intersection of art and exact sciences, the nature of the
                artistic process in the context of generative art and the relationship of generative art with different
                types of media (2D printing, 3D printing and pen plotting; projections, interactive “sketches”). Other
                topics of interest are: physical and biological simulations, mathematical art, complex systems, signed
                distance functions, cartography, pen-plotters, fractals and abstract procedural art.
              </p>
            </div>
          </Section>

          <Section id="oss" title="Open Source" gradient="from-lime-500 to-green-600">
            <div className="w-full md:w-3/4">
              <p>
                I’m the creator of the open-source Python package <strong>prettymaps</strong> (now boasting more than 10k stars on
                GitHub!) which allows anyone to create highly stylized maps from public OpenStreetMap data for free.{' '}
                <a
                  href="https://github.com/marceloprates/prettymaps"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                  aria-label="prettymaps on GitHub"
                >
                  Visit the repository
                </a>.
              </p>
            </div>
          </Section>
        </div>
      </div >
    </section >
  );
}
