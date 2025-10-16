import { AnimatedNumber } from "@/components/ui/animatedCounter";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { EventGallery } from "@/components/ui/EventGallery";
import { FadeInOnScroll } from "@/components/ui/FadeInOnScroll";
import { MemberCards } from "@/components/ui/MemberCards";
import { Socials } from "@/components/ui/Socials";
import { UpcomingEvents } from "@/components/ui/UpcomingEvents";
import { createClient, type QueryParams } from "@sanity/client";
import Image from "next/image";
import React from "react";
import { config } from "../../config";

// Interface for a single event
interface Event {
  title: string;
  description: string;
  images?: Array<{ image: string }>;
  videos?: Array<{ video: string }>;
}

// Interface for a single upcoming event
interface UpcomingEvent {
  title: string;
  description?: string;
  schedule?: string;
}

// Interface for social links
interface Links {
  gmail?: string;
  linkedin?: string;
  instagram?: string;
  twitter?: string;
  website?: string;
  github?: string;
}

// Main Club interface, including new fields
interface Club {
  _id: string;
  name: string;
  description: string;
  logo?: string;
  image?: string;
  memberCount: number;
  members?: Array<{ name: string; position: string; image?: string }>;
  alumni?: Array<{ name: string; position: string; image?: string }>;
  faculty?: string;
  profile_link?: string;
  events?: Event[];
  upcomingEvents?: UpcomingEvent[];
  links?: Links;
  vision?: string;
  mission?: string;
  slug?: {
    current: string;
  };
}

// Create a dedicated Sanity client instance for this page
const techClubsClient = createClient({
  projectId: config.projectId,
  dataset: config.dataset,
  apiVersion: "2025-02-19",
  useCdn: false,
});

// Create a dedicated fetch function for this page
const get = async <T,>(query: string, params?: QueryParams): Promise<T> => {
  try {
    const res = await techClubsClient.fetch<T>(query, { ...params });
    return res;
  } catch (err) {
    console.error("Error fetching technical clubs:", err);
    return null as T;
  }
};

// This function tells Next.js all the possible 'club' slugs to pre-render.
export async function generateStaticParams() {
  const query = `*[_type == "techClub"]{ "club": slug.current }`;
  const slugs = await get<{ club: string }[]>(query);
  return slugs || [];
}

// Updated query to fetch all club data, including upcoming events and links
async function getClubBySlug(slug: string): Promise<Club | null> {
  const query = `*[_type == "techClub" && slug.current == $slug][0]{
    _id,
    name,
    description,
    logo,
    image,
    memberCount,
    members[]{
      name,
      position,
      image
    },
    alumni[]{
      name,
      position,
      image
    },
    faculty,
    profile_link,
    events[]{
      title,
      description,
      images[]{
        image
      },
      videos[]{
        video
      }
    },
    upcomingEvents[]{
      title,
      description,
      schedule
    },
    links{
      gmail,
      linkedin,
      instagram,
      twitter,
      website,
      github
    },
    vision,
    mission,
    slug
  }`;

  const result = await get<Club | null>(query, { slug });
  return result;
}

export default async function ClubPage({
  params,
}: {
  params: { club: string };
}): Promise<React.ReactElement> {
  const { club } = await params;
  const clubData = await getClubBySlug(club);

  if (!clubData) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="text-title-1 font-bold text-gray-900">
          Club not found.
        </div>
      </main>
    );
  }

  clubData.name = clubData.name.includes("IIIT Dharwad")
    ? clubData.name
    : clubData.name + " IIIT Dharwad";

  const memberPhrases = [
    { text: `${clubData.name} has # active members.` },
    { text: `# minds. One vision. ${clubData.name}.` },
    { text: `${clubData.name} — Home to # Active Members` },
    { text: `${clubData.name} — Powered by # Active Innovators` },
    {
      text: `# Active Members and Counting — The Momentum of ${clubData.name}.`,
    },
    { text: `Where # Brilliant Minds Unite — ${clubData.name}.` },
  ];

  // Pick a random phrase
  const randomIndex = Math.floor(Math.random() * memberPhrases.length);
  const selectedPhrase = memberPhrases[randomIndex]?.text || "";

  // Split the selected phrase at the placeholder
  const [part1, part2] = selectedPhrase.split("#");

  let clubNameForHeader = clubData.name;
  if (!clubNameForHeader.includes("IIIT Dharwad")) {
    clubNameForHeader += " IIIT Dharwad";
  }

  let breadcrumbName = clubData.name;
  if (breadcrumbName.includes("IIIT Dharwad")) {
    breadcrumbName = breadcrumbName.replace(" IIIT Dharwad", "").trim();
  }

  const breadcrumbs = [
    { title: "Home", href: "/" },
    { title: "Student Life", href: "/student-life/overview" },
    { title: "Clubs", href: "/student-life/clubs" },
    { title: "Technical Clubs", href: "/student-life/clubs/tech" },
    {
      title: breadcrumbName,
      href: `/student-life/clubs/tech/${clubData.slug?.current}`,
    },
  ];

  const toId = (text: string) => text.replace(/\s+/g, "-").toLowerCase();

  return (
    <main>
      <div className="relative h-[60vh] w-full">
        {clubData.image && (
          <Image
            src={clubData.image}
            alt={`${clubData.name} cover image`}
            fill
            priority
            className="object-contain object-center"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/30" />
        <div className="absolute bottom-16 left-0 right-0 z-10 mx-auto w-[87.5vw] max-w-[1680px]">
          <h1 className="font-semibold text-main-title text-white">
            {clubNameForHeader}
          </h1>
        </div>
      </div>

      <div className="bg-white py-4">
        <div className="mx-auto w-[87.5vw] max-w-[1680px]">
          <Breadcrumbs breadcrumbs={breadcrumbs} />
        </div>
      </div>

      <div className="mx-auto flex w-[87.5vw] max-w-[1680px] flex-col items-center py-12">
        {/* About, Vision, Mission Section */}
        <section className="mb-12 grid w-full grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          <FadeInOnScroll>
            <div className="rounded-2xl border bg-gray-100 p-6 shadow-lg">
              <h2 className="mb-2 text-center text-title-1 font-bold">
                About {clubData.name}
              </h2>
              <p className="text-center text-body text-gray-700 whitespace-pre-wrap">
                {clubData.description}
              </p>
            </div>
          </FadeInOnScroll>
          {clubData.vision && (
            <FadeInOnScroll delay={0.2}>
              <div className="rounded-2xl border bg-gray-100 p-6 shadow-lg">
                <h2 className="mb-2 text-center text-title-1 font-bold">
                  Vision of {clubData.name}
                </h2>
                <p className="text-center text-body text-gray-700 whitespace-pre-wrap">
                  {clubData.vision}
                </p>
              </div>
            </FadeInOnScroll>
          )}
          {clubData.mission && (
            <FadeInOnScroll delay={0.4}>
              <div className="col-span-1 rounded-2xl border bg-gray-100 p-6 shadow-lg md:col-span-2 lg:col-span-1">
                <h2 className="mb-2 text-center text-title-1 font-bold">
                  Mission of {clubData.name}
                </h2>
                <p className="text-center text-body text-gray-700 whitespace-pre-wrap">
                  {clubData.mission}
                </p>
              </div>
            </FadeInOnScroll>
          )}
        </section>

        {/* Current Members Section */}
        {clubData.members && clubData.members.length > 0 && (
          <section id={toId("Current Members")} className="mb-12 mt-8 w-full">
            <FadeInOnScroll>
              <h2 className="mb-8 text-center text-4xl font-bold text-gray-900">
                Current Members of {clubData.name}
              </h2>
            </FadeInOnScroll>

            <div className="flex flex-col items-center gap-8">
              <MemberCards members={clubData.members} />

              <p className="mt-8 mb-4 text-center text-xl text-body text-gray-700">
                {/* Render the sentence parts and the animated number safely */}
                {part1}
                <AnimatedNumber targetValue={clubData.memberCount || 0} />
                {part2}
              </p>
            </div>
          </section>
        )}

        {/* Alumni Section */}
        {clubData.alumni && clubData.alumni.length > 0 && (
          <section id={toId("Alumni")} className="mb-12 w-full">
            <FadeInOnScroll>
              <h2 className="mb-8 text-center text-4xl font-bold text-gray-900">
                Alumni of {clubData.name}
              </h2>
            </FadeInOnScroll>

            <div className="flex flex-col items-center gap-6">
              <MemberCards members={clubData.alumni} />
              <p className="mt-4 text-center text-2xl text-body text-gray-700">
                Our distinguished alumni continue to make their mark in various
                fields.
              </p>
            </div>
          </section>
        )}

        {/* Faculty Advisor Section */}
        {(clubData.faculty && clubData.faculty.length > 0) && (clubData.profile_link && clubData.profile_link.length > 0) && (
          <p className="mt-4 mb-17 text-center text-2xl text-body text-gray-700">
            Faculty Advisor for the Club:{' '}<span className="hover:text-blue-600"><strong><a href={clubData.profile_link} target="_blank" rel="noopener noreferrer">{clubData.faculty}</a></strong></span>
          </p>
        )}

        {/* Past Events Section */}
        {clubData.events && clubData.events.length > 0 && (
          <EventGallery events={clubData.events} clubName={clubData.name} />
        )}

        {/* Upcoming Events Section */}
        {clubData.upcomingEvents && clubData.upcomingEvents.length > 0 && (
          <UpcomingEvents events={clubData.upcomingEvents} />
        )}

        {/* Socials Section */}
        {clubData.links && (
          <Socials links={clubData.links} clubName={clubData.name} />
        )}
      </div>
    </main>
  );
}
