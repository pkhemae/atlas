import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@atlas/ui/components/accordion";
import { Reveal } from "@/pages/landing/ui/reveal";

const FAQ_ITEMS = [
  {
    question: "Is Atlas free to use?",
    answer:
      "Atlas has a free tier while in beta. The source code is available on GitHub, so you can inspect and self-host it subject to the license terms.",
  },
  {
    question: "Which platforms are supported?",
    answer:
      "Atlas ships for macOS today. Lorem ipsum dolor sit amet, consectetur adipiscing elit — Windows and Linux builds are on the roadmap.",
  },
  {
    question: "How do focus sessions work?",
    answer:
      "Start a session, pick a duration, and Atlas keeps distractions away until the timer ends. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
  {
    question: "Can I sync my progress across devices?",
    answer:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Progress syncing is planned alongside Atlas accounts, ut enim ad minim veniam.",
  },
  {
    question: "Do I need an account to get started?",
    answer:
      "No — download Atlas and start your first focus session right away. Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo.",
  },
];

export function FaqSection() {
  return (
    <section className="mx-auto grid w-full max-w-5xl gap-12 px-6 py-24 md:grid-cols-[1fr_1.4fr]">
      <Reveal>
        <h2 className="max-w-xs text-balance text-4xl font-semibold tracking-tight">
          Frequently asked questions
        </h2>
      </Reveal>
      <Reveal className="delay-100">
        <Accordion type="single" collapsible>
          {FAQ_ITEMS.map((item) => (
            <AccordionItem key={item.question} value={item.question}>
              <AccordionTrigger className="text-base font-medium">{item.question}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Reveal>
    </section>
  );
}
