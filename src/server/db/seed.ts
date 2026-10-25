import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import * as schema from "./schema";
import { DEFAULT_TENANT_SLUG, DEMO_TENANT_ID } from "../../lib/tenant";
import { tenantContact } from "@/server/db/schema";

const connectionString =
  process.env.DATABASE_URL_UNPOOLED ||
  process.env.DATABASE_URL_DIRECT ||
  process.env.DATABASE_URL ||
  process.env.DATABASE_URL_POOLED;

if (!connectionString) {
  throw new Error("DATABASE_URL or DATABASE_URL_UNPOOLED is missing.");
}

const sql = neon(connectionString);
const db = drizzle(sql, { schema });

function getTodayCairo(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Cairo",
  }).format(new Date());
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export async function seed() {
  if (
    process.env.NODE_ENV === "production" ||
    process.env.NEON_BRANCH === "production"
  ) {
    throw new Error("Seed is forbidden in production environment!");
  }

  console.log(`Starting idempotent seed for demo tenant (${DEFAULT_TENANT_SLUG})...`);

  // Idempotent: delete existing demo tenant data (cascades to rooms, experiences, bookings, inquiries)
  await db.delete(schema.tenants).where(eq(schema.tenants.id, DEMO_TENANT_ID));

  console.log("Seeding demo tenant...");
  await db.insert(schema.tenants).values({
    id: DEMO_TENANT_ID,
    slug: DEFAULT_TENANT_SLUG,
    name: "Demo Hotel Aswan",
    defaultLocale: "en",
    whatsappNumber: "201104328077",
    contactEmail: "auricdevs@gmail.com",
    currency: "USD",
    timezone: "Africa/Cairo",
    modules: {
      experiences: true,
      offers: false,
      content: false,
      reports: false,
    },
  });

  console.log("Seeding 6 rooms...");
  const roomIds = [
    "00000000-0000-0000-0001-000000000001",
    "00000000-0000-0000-0001-000000000002",
    "00000000-0000-0000-0001-000000000003",
    "00000000-0000-0000-0001-000000000004",
    "00000000-0000-0000-0001-000000000005",
    "00000000-0000-0000-0001-000000000006",
  ];

  const sampleRooms: schema.NewRoom[] = [
    {
      id: roomIds[0],
      tenantId: DEMO_TENANT_ID,
      slug: "royal-nile-suite",
      nameEn: "Royal Nile Suite",
      nameAr: "جناح النيل الملكي",
      descriptionEn: "Panoramic views of the Nile with a private terrace and luxury soaking bath.",
      descriptionAr: "إطلالات بانورامية خلابة على مجرى النيل الخالد مع تراس خاص وحمام رخامي فاخر.",
      view: "nile",
      bedType: "King",
      sizeSqm: 85,
      capacity: 2,
      basePriceCents: 45000,
      amenities: ["Nile view terrace", "Freestanding bath", "Butler service", "Breakfast included"],
      images: ["/gallery-1.jpg"],
      isActive: true,
      sortOrder: 1,
    },
    {
      id: roomIds[1],
      tenantId: DEMO_TENANT_ID,
      slug: "executive-nile-suite",
      nameEn: "Executive Nile Suite",
      nameAr: "جناح النيل التنفيذي",
      descriptionEn: "Spacious riverside suite featuring handcrafted Nubian accents and balcony.",
      descriptionAr: "جناح فسيح على ضفاف النيل مزين بتفاصيل نوبية يدوية مع شرفة مشمسة.",
      view: "nile",
      bedType: "King",
      sizeSqm: 65,
      capacity: 2,
      basePriceCents: 35000,
      amenities: ["Panoramic balcony", "Walk-in shower", "Espresso bar", "Breakfast included"],
      images: ["/gallery-2.jpg"],
      isActive: true,
      sortOrder: 2,
    },
    {
      id: roomIds[2],
      tenantId: DEMO_TENANT_ID,
      slug: "deluxe-nile-room",
      nameEn: "Deluxe Nile View Room",
      nameAr: "غرفة ديلوكس بإطلالة نيلية",
      descriptionEn: "Intimate and serene retreat overlooking the Feluccas drifting along the river.",
      descriptionAr: "ملاذ هادئ ودافئ يطل مباشرة على مراكب الفلوكة الشراعية المنسابة في النهر.",
      view: "nile",
      bedType: "King",
      sizeSqm: 45,
      capacity: 2,
      basePriceCents: 26000,
      amenities: ["Riverfront balcony", "Nubian cotton linens", "Espresso machine"],
      images: ["/gallery-3.jpg"],
      isActive: true,
      sortOrder: 3,
    },
    {
      id: roomIds[3],
      tenantId: DEMO_TENANT_ID,
      slug: "garden-heritage-suite",
      nameEn: "Garden Heritage Suite",
      nameAr: "جناح التراث بإطلالة الحديقة",
      descriptionEn: "Surrounded by bougainvillea and date palms with an expansive living salon.",
      descriptionAr: "محاط بزهور الجهنمية ونخيل أسوان مع بهو جلوس رحب وتصميم مستوحى من الطبيعة.",
      view: "garden",
      bedType: "King",
      sizeSqm: 60,
      capacity: 3,
      basePriceCents: 24000,
      amenities: ["Private patio", "Courtyard view", "Handcrafted furnishings"],
      images: ["/gallery-4.jpg"],
      isActive: true,
      sortOrder: 4,
    },
    {
      id: roomIds[4],
      tenantId: DEMO_TENANT_ID,
      slug: "deluxe-garden-twin",
      nameEn: "Deluxe Garden Twin Room",
      nameAr: "غرفة ديلوكس بسريرين مفردين وإطلالة حديقة",
      descriptionEn: "Twin beds with custom Nubian textiles opening to a shaded garden loggia.",
      descriptionAr: "غرفة بسريرين مفردين مزينة بمنسوجات نوبية أصيلة وتفتح على شرفة مظللة.",
      view: "garden",
      bedType: "Twin",
      sizeSqm: 42,
      capacity: 2,
      basePriceCents: 19000,
      amenities: ["Garden loggia", "Artisan tea bar", "Marble bathroom"],
      images: ["/gallery-2.jpg"],
      isActive: true,
      sortOrder: 5,
    },
    {
      id: roomIds[5],
      tenantId: DEMO_TENANT_ID,
      slug: "classic-palm-room",
      nameEn: "Classic Palm Room",
      nameAr: "غرفة النخيل الكلاسيكية",
      descriptionEn: "Quiet courtyard chamber offering authentic stone textures and calm ambiance.",
      descriptionAr: "غرفة هادئة مطلة على فناء النخيل تتميز بجدران حجرية تقليدية وأجواء من السكينة.",
      view: "garden",
      bedType: "Queen",
      sizeSqm: 36,
      capacity: 2,
      basePriceCents: 15000,
      amenities: ["Courtyard outlook", "Work desk", "Walk-in rain shower"],
      images: ["/gallery-1.jpg"],
      isActive: true,
      sortOrder: 6,
    },
  ];

  await db.insert(schema.rooms).values(sampleRooms);

  console.log("Seeding 6 experiences...");
  const sampleExperiences: schema.NewExperience[] = [
    {
      tenantId: DEMO_TENANT_ID,
      slug: "felucca-sunset",
      nameEn: "Felucca Sunset Sailing",
      nameAr: "إبحار بالفلوكة عند الغروب",
      descriptionEn: "Private sailing along Elephantine Island during golden hour with mint tea.",
      descriptionAr: "إبحار شراعي خاص حول جزيرة إلفنتين في الساعات الذهبية مصحوباً بالشاي بالنعناع.",
      priceCents: 6000,
      durationMinutes: 90,
      images: ["/experience/felucca.jpg"],
      isActive: true,
      sortOrder: 1,
    },
    {
      tenantId: DEMO_TENANT_ID,
      slug: "nubian-village-visit",
      nameEn: "Nubian Village Visit",
      nameAr: "زيارة القرية النوبية",
      descriptionEn: "Cultural boat journey exploring authentic traditions, architecture, and hospitality.",
      descriptionAr: "جولة نيلية وثقافية للتعرف على كرم الضيافة وعمارة البيوت النوبية الملونة.",
      priceCents: 7500,
      durationMinutes: 150,
      images: ["/experience/Nuba.jpg"],
      isActive: true,
      sortOrder: 2,
    },
    {
      tenantId: DEMO_TENANT_ID,
      slug: "abu-simbel-day-trip",
      nameEn: "Abu Simbel Day Trip",
      nameAr: "رحلة يوم كامل إلى أبو سمبل",
      descriptionEn: "Chauffeured trip to the magnificent cliffside temples of Ramses II and Nefertari.",
      descriptionAr: "رحلة بالسيارة الخاصة لزيارة معبدي رمسيس الثاني ونفرتاري الشامخين في أبو سمبل.",
      priceCents: 22000,
      durationMinutes: 480,
      images: ["/experience/Abu Simbel.png"],
      isActive: true,
      sortOrder: 3,
    },
    {
      tenantId: DEMO_TENANT_ID,
      slug: "philae-temple",
      nameEn: "Philae Temple Private Tour",
      nameAr: "جولة خاصة في معبد فيلة",
      descriptionEn: "Boat excursion to the Island of Agilkia with a dedicated Egyptologist guide.",
      descriptionAr: "رحلة نهرية خاصة إلى جزيرة أجيليكا بصحبة مرشد متخصص في علم المصريات.",
      priceCents: 11000,
      durationMinutes: 180,
      images: ["/experience/temple of philae.png"],
      isActive: true,
      sortOrder: 4,
    },
    {
      tenantId: DEMO_TENANT_ID,
      slug: "elephantine-island",
      nameEn: "Elephantine Island Tour",
      nameAr: "جولة جزيرة إلفنتين",
      descriptionEn: "Historical walk visiting ancient Nilometers and ruins spanning thousands of years.",
      descriptionAr: "جولة استكشافية تاريخية تشمل مقياس النيل القديم والآثار الفرعونية بالجزيرة.",
      priceCents: 5000,
      durationMinutes: 120,
      images: ["/gallery-3.jpg"],
      isActive: true,
      sortOrder: 5,
    },
    {
      tenantId: DEMO_TENANT_ID,
      slug: "airport-transfer",
      nameEn: "Airport Transfer",
      nameAr: "خدمة التوصيل من وإلى المطار",
      descriptionEn: "Private luxury chauffeur service between Aswan Airport and the hotel.",
      descriptionAr: "خدمة توصيل مريحة بسيارة فارهة وسائق خاص بين مطار أسوان ومقر الفندق.",
      priceCents: 4500,
      durationMinutes: 45,
      images: ["/gallery-4.jpg"],
      isActive: true,
      sortOrder: 6,
    },
  ];

  await db.insert(schema.experiences).values(sampleExperiences);

  console.log("Seeding 15 bookings covering all statuses...");
  const today = getTodayCairo();

  const sampleBookings: schema.NewBooking[] = [
    // Room 1 (Royal Nile): checked_in, confirmed, checked_out, pending (no overlap)
    {
      tenantId: DEMO_TENANT_ID,
      roomId: roomIds[0],
      reference: "AUR-RN001",
      checkIn: addDays(today, -2),
      checkOut: addDays(today, 2),
      adults: 2,
      children: 0,
      guestName: "Lady Eleanor Vance",
      guestPhone: "+447700900123",
      guestEmail: "eleanor.vance@example.co.uk",
      guestCountry: "GB",
      status: "checked_in",
      totalPriceCents: 45000 * 4,
      source: "website",
    },
    {
      tenantId: DEMO_TENANT_ID,
      roomId: roomIds[0],
      reference: "AUR-RN002",
      checkIn: addDays(today, 3),
      checkOut: addDays(today, 7),
      adults: 2,
      children: 0,
      guestName: "Tariq Al-Mansoor",
      guestPhone: "+971501234567",
      guestEmail: "tariq.mansoor@example.ae",
      guestCountry: "AE",
      status: "confirmed",
      totalPriceCents: 45000 * 4,
      source: "website",
      confirmedAt: new Date(),
    },
    {
      tenantId: DEMO_TENANT_ID,
      roomId: roomIds[0],
      reference: "AUR-RN003",
      checkIn: addDays(today, -8),
      checkOut: addDays(today, -3),
      adults: 2,
      children: 0,
      guestName: "Dr. Arthur Pendelton",
      guestPhone: "+12125550188",
      guestEmail: "art.pendelton@example.com",
      guestCountry: "US",
      status: "checked_out",
      totalPriceCents: 45000 * 5,
      source: "website",
    },
    {
      tenantId: DEMO_TENANT_ID,
      roomId: roomIds[0],
      reference: "AUR-RN004",
      checkIn: addDays(today, 10),
      checkOut: addDays(today, 14),
      adults: 2,
      children: 0,
      guestName: "Sophie Martin",
      guestPhone: "+33612345678",
      guestEmail: "sophie.martin@example.fr",
      guestCountry: "FR",
      status: "pending",
      totalPriceCents: 45000 * 4,
      source: "website",
    },

    // Room 2 (Executive Nile): confirmed (ARRIVING TODAY), confirmed, cancelled, declined
    {
      tenantId: DEMO_TENANT_ID,
      roomId: roomIds[1],
      reference: "AUR-EX001",
      checkIn: today, // Arrival TODAY!
      checkOut: addDays(today, 3),
      adults: 2,
      children: 0,
      guestName: "Nasser Al-Ghamdi",
      guestPhone: "+966551234567",
      guestEmail: "nasser.ghamdi@example.sa",
      guestCountry: "SA",
      status: "confirmed",
      totalPriceCents: 35000 * 3,
      source: "website",
      confirmedAt: new Date(),
    },
    {
      tenantId: DEMO_TENANT_ID,
      roomId: roomIds[1],
      reference: "AUR-EX002",
      checkIn: addDays(today, 4),
      checkOut: addDays(today, 7),
      adults: 2,
      children: 0,
      guestName: "Elena Rostova",
      guestPhone: "+4915123456789",
      guestEmail: "elena.rostova@example.de",
      guestCountry: "DE",
      status: "confirmed",
      totalPriceCents: 35000 * 3,
      source: "website",
      confirmedAt: new Date(),
    },
    {
      tenantId: DEMO_TENANT_ID,
      roomId: roomIds[1],
      reference: "AUR-EX003",
      checkIn: addDays(today, 8),
      checkOut: addDays(today, 11),
      adults: 2,
      children: 0,
      guestName: "Lucas Silva",
      guestPhone: "+5511987654321",
      guestEmail: "lucas.silva@example.br",
      guestCountry: "BR",
      status: "cancelled",
      totalPriceCents: 35000 * 3,
      source: "website",
    },
    {
      tenantId: DEMO_TENANT_ID,
      roomId: roomIds[1],
      reference: "AUR-EX004",
      checkIn: addDays(today, 12),
      checkOut: addDays(today, 15),
      adults: 2,
      children: 0,
      guestName: "Klaus Weber",
      guestPhone: "+436761234567",
      guestEmail: "klaus.weber@example.at",
      guestCountry: "AT",
      status: "declined",
      totalPriceCents: 35000 * 3,
      source: "website",
    },

    // Room 3 (Deluxe Nile): checked_in (DEPARTING TODAY), confirmed, no_show
    {
      tenantId: DEMO_TENANT_ID,
      roomId: roomIds[2],
      reference: "AUR-DL001",
      checkIn: addDays(today, -3),
      checkOut: today, // Departure TODAY!
      adults: 2,
      children: 0,
      guestName: "Amira Hassan",
      guestPhone: "+201012345678",
      guestEmail: "amira.hassan@example.eg",
      guestCountry: "EG",
      status: "checked_in",
      totalPriceCents: 26000 * 3,
      source: "website",
    },
    {
      tenantId: DEMO_TENANT_ID,
      roomId: roomIds[2],
      reference: "AUR-DL002",
      checkIn: addDays(today, 2),
      checkOut: addDays(today, 5),
      adults: 2,
      children: 0,
      guestName: "Hiroshi Tanaka",
      guestPhone: "+819012345678",
      guestEmail: "hiroshi.tanaka@example.jp",
      guestCountry: "JP",
      status: "confirmed",
      totalPriceCents: 26000 * 3,
      source: "website",
      confirmedAt: new Date(),
    },
    {
      tenantId: DEMO_TENANT_ID,
      roomId: roomIds[2],
      reference: "AUR-DL003",
      checkIn: addDays(today, -6),
      checkOut: addDays(today, -4),
      adults: 2,
      children: 0,
      guestName: "James O'Connor",
      guestPhone: "+353871234567",
      guestEmail: "james.oconnor@example.ie",
      guestCountry: "IE",
      status: "no_show",
      totalPriceCents: 26000 * 2,
      source: "website",
    },

    // Room 4 (Garden Heritage): pending, confirmed, checked_out
    {
      tenantId: DEMO_TENANT_ID,
      roomId: roomIds[3],
      reference: "AUR-GH001",
      checkIn: addDays(today, 1),
      checkOut: addDays(today, 4),
      adults: 2,
      children: 1,
      guestName: "Fatima Zahra",
      guestPhone: "+212661234567",
      guestEmail: "fatima.zahra@example.ma",
      guestCountry: "MA",
      status: "pending", // Pending request!
      totalPriceCents: 24000 * 3,
      source: "website",
    },
    {
      tenantId: DEMO_TENANT_ID,
      roomId: roomIds[3],
      reference: "AUR-GH002",
      checkIn: addDays(today, 5),
      checkOut: addDays(today, 8),
      adults: 3,
      children: 0,
      guestName: "Matteo Rossi",
      guestPhone: "+393401234567",
      guestEmail: "matteo.rossi@example.it",
      guestCountry: "IT",
      status: "confirmed",
      totalPriceCents: 24000 * 3,
      source: "website",
      confirmedAt: new Date(),
    },
    {
      tenantId: DEMO_TENANT_ID,
      roomId: roomIds[3],
      reference: "AUR-GH003",
      checkIn: addDays(today, -11),
      checkOut: addDays(today, -7),
      adults: 2,
      children: 0,
      guestName: "Helena Lindqvist",
      guestPhone: "+46701234567",
      guestEmail: "helena.lindqvist@example.se",
      guestCountry: "SE",
      status: "checked_out",
      totalPriceCents: 24000 * 4,
      source: "website",
    },

    // Room 5 (Deluxe Garden Twin): pending request
    {
      tenantId: DEMO_TENANT_ID,
      roomId: roomIds[4],
      reference: "AUR-GT001",
      checkIn: addDays(today, 2),
      checkOut: addDays(today, 6),
      adults: 2,
      children: 0,
      guestName: "Chloe Dupont",
      guestPhone: "+32470123456",
      guestEmail: "chloe.dupont@example.be",
      guestCountry: "BE",
      status: "pending", // Pending request!
      totalPriceCents: 19000 * 4,
      source: "website",
    },
  ];

  await db.insert(schema.bookings).values(sampleBookings);

  console.log("Seeding 4 inquiries...");
  const sampleInquiries: schema.NewInquiry[] = [
    {
      tenantId: DEMO_TENANT_ID,
      name: "Marcus Aurelius",
      email: "marcus@rome-travels.com",
      phone: "+3906123456",
      message: "Inquiring about private buyout options for a family reunion in November.",
      status: "new",
    },
    {
      tenantId: DEMO_TENANT_ID,
      name: "Layla Mostafa",
      email: "layla.mostafa@example.eg",
      phone: "+201200000001",
      message: "Do you offer private Felucca catering with vegan Nubian options?",
      status: "new",
    },
    {
      tenantId: DEMO_TENANT_ID,
      name: "Sir Charles Grey",
      email: "charles.grey@example.co.uk",
      phone: "+442079460123",
      message: "Looking to arrange airport transfer and Philae Temple guide for 4 guests.",
      status: "replied",
    },
    {
      tenantId: DEMO_TENANT_ID,
      name: "Hassan Qabbani",
      email: "hassan.qabbani@example.com",
      phone: "+9613123456",
      message: "Requesting high-speed wifi confirmation for remote work during stay.",
      status: "closed",
    },
  ];
  await db.insert(schema.inquiries).values(sampleInquiries);

await db
  .insert(tenantContact)
  .values({
    tenantId: DEMO_TENANT_ID,
    phone: "+20 110 432 8077",
    whatsapp: "+20 110 432 8077",
    email: "auricdevs@gmail.com",
    addressEn: "Corniche El Nile, Aswan, Egypt",
    addressAr: "كورنيش النيل، أسوان، مصر",
    hoursEn: "Reception open 24 hours",
    hoursAr: "الاستقبال متاح على مدار الساعة",
    mapQuery: "Corniche El Nile, Aswan, Egypt",
  })
  .onConflictDoNothing();

  console.log("Seed complete! 1 tenant, 6 rooms, 6 experiences, 15 bookings, 4 inquiries.");
}

if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Seed failed:", err);
      process.exit(1);
    });
}
