import { Icons } from "@/components/icons";
import { HomeIcon, NotebookIcon } from "lucide-react";

export const DATA = {
  name: "Harry Watson",
  initials: "HW",
  url: "https://harrydatahub.com",
  location: "Melbourne, Australia",
  locationLink: "https://www.google.com/maps/place/melbourne",
  description:
    "Data Engineer and Software Engineer. Improving human society through technology and digital health.",
  summary:
    "I am a data engineer and software engineer focused on improving human society through technology and digital health. My work spans data engineering, software development, and DevOps, with an emphasis on building maintainable systems, reliable platforms, and practical products that connect data to real-world outcomes. I enjoy working across the stack, from modern frontend frameworks to cloud infrastructure and large-scale data tooling.",
  avatarUrl: "",
  techStack: [
    {
      title: "SaaS",
      groups: [
        {
          title: "Language",
          skills: ["Python", "Java", "Rust", "Go", "Scala", "Typescript"],
        },
        {
          title: "Framework",
          subgroups: [
            {
              title: "Frontend",
              skills: ["React", "Angular", "Tailwind CSS"],
            },
            {
              title: "Backend",
              skills: ["FastAPI", "Flask", "Django", "Next.js", "Node.js"],
            },
          ],
        },
      ],
    },
    {
      title: "Data Engineering",
      groups: [
        {
          title: "Platform",
          skills: [
            "Databricks",
            "Snowflake",
            "Spark",
            "Kafka",
            "PostgreSQL",
            "MongoDB",
          ],
        },
      ],
    },
    {
      title: "Data Science",
      groups: [
        {
          title: "Toolkit",
          skills: [
            "scikit-learn",
            "TensorFlow",
            "PyTorch",
            "NumPy",
            "Matplotlib",
            "Plotly",
          ],
        },
      ],
    },
    {
      title: "Mobile Platform and 3D Modelling",
      groups: [
        {
          title: "Build",
          skills: ["Kotlin", "Swift", "Unity", "Unreal Engine", "C#"],
        },
      ],
    },
    {
      title: "Cloud and DevOps",
      groups: [
        {
          title: "Infrastructure",
          skills: [
            "AWS",
            "Azure",
            "GCP",
            "Bash",
            "PowerShell",
            "Terraform",
            "Git",
            "Docker",
            "Kubernetes",
            "Cloudflare",
          ],
        },
      ],
    },
    {
      title: "Others",
      groups: [
        {
          title: "Tools",
          skills: ["GraphQL", "Prisma", "Markdown", "LaTeX"],
        },
      ],
    },
  ],
  navbar: [
    { href: "/", icon: HomeIcon, label: "Home" },
    { href: "/blog", icon: NotebookIcon, label: "Blog" },
  ],
  contact: {
    email: "hello@example.com",
    tel: "+123456789",
    social: {
      GitHub: {
        name: "GitHub",
        url: "https://github.com/watanaberyunosuke",
        icon: Icons.GitHub,
        navbar: true,
      },
      LinkedIn: {
        name: "LinkedIn",
        url: "https://www.linkedin.com/in/harry-zhan-watson-30486b134/",
        icon: Icons.LinkedIn,
        navbar: true,
      },
      X: {
        name: "X",
        url: "https://x.com/watanaberyunosuke",
        icon: Icons.X,
        navbar: true,
      },
      email: {
        name: "Send Email",
        url: "mailto:hello@example.com",
        icon: Icons.Email,
        navbar: false,
      },
    },
  },

  work: [
    {
      company: "Yarra Valley Water",
      href: "https://www.yvw.com.au",
      badges: [],
      location: "Melbourne, VIC",
      title: "Senior Data Analytics Specialist",
      logoUrl: "",
      start: "Sep 2025",
      end: "Present",
      description:
        "Lead the design, optimisation, and operational reliability of digital-metering and water-analytics data platforms. Drive architectural improvements across ingestion, storage, modelling, and reporting layers using Databricks and Spark Structured Streaming. Implement CI/CD automation with Azure DevOps.",
    },
    {
      company: "Halo Lab",
      href: "#",
      badges: [],
      location: "Melbourne, VIC",
      title: "Data Engineer",
      logoUrl: "",
      start: "Jan 2024",
      end: "Sep 2025",
      description:
        "Developed and maintained data platforms and clinical manager database connections. Implemented ETL pipelines and data platform solutions using Databricks and Airflow.",
    },
    {
      company: "BOQ Group",
      href: "https://www.boq.com.au",
      badges: [],
      location: "Melbourne, VIC",
      title: "Associate Data Engineer",
      logoUrl: "",
      start: "Jan 2024",
      end: "Present",
      description:
        "Work on the flagship Intelligent Data Platform, enhancing ETL pipelines and maintaining a scalable enterprise data warehouse. Manage daily operations with Azure Data Factory, resulting in a 30% reduction in processing time. Implement data streaming solutions using EventHub, Kafka, and Databricks.",
    },
    {
      company: "Randstad / Department for Education (SA)",
      href: "https://www.education.sa.gov.au",
      badges: [],
      location: "Adelaide, SA",
      title: "Data Engineer",
      logoUrl: "",
      start: "Aug 2023",
      end: "Jan 2024",
      description:
        "Utilised Azure Databricks to process and transform large datasets for analytics. Implemented ETL pipelines using Azure Data Factory and designed PowerBI dashboards for department stakeholders. Decoded legacy SSRS code to extract critical business logic.",
    },
  ],
  education: [
    {
      school: "Monash University",
      href: "https://www.monash.edu",
      degree: "Master of Information Technology",
      logoUrl: "",
      start: "2021",
      end: "2023",
    },
    {
      school: "RMIT University",
      href: "https://www.rmit.edu.au/",
      degree: "Bachelor of Business (Economics and Finance)",
      logoUrl: "/rmit.png",
      start: "2018",
      end: "2020",
    },
  ],
  projects: [
    {
      title: "Bore (Bandicoot Outreach and Revival Endeavor)",
      href: "https://bore.bio",
      dates: "Mar 2023 - Jun 2023",
      active: true,
      description:
        "Participated in the creation and enhancement of bore.bio, a comprehensive platform for the revival of bandicoots. Implemented a robust web infrastructure using Angular and Flask, and developed an image recognition app using Kotlin and Swift. Received students’ choice award for best project.",
      technologies: [
        "Angular",
        "Python",
        "Flask",
        "AWS Lambda",
        "AWS S3",
        "AWS Redshift",
        "Spark",
        "YOLOv8",
      ],
      links: [
        {
          type: "Website",
          href: "https://bore.bio",
          icon: <Icons.Globe className="size-3" />,
        },
      ],
      image: "",
      video: "",
    },
    {
      title: "PathOut",
      href: "#",
      dates: "Mar 2022 - May 2022",
      active: true,
      description:
        "An Android navigation app written in Kotlin, using MapBox as GIS system, designed for Victoria Residents. Consumes Android sensor data (GPS, Accelerometer) and integrates PTV API.",
      technologies: [
        "Kotlin",
        "Android",
        "MapBox",
        "Firebase",
      ],
      links: [],
      image: "",
      video: "",
    },
  ],
  hackathons: [] as {
    title: string;
    dates: string;
    location: string;
    description: string;
    image?: string;
    links?: { title: string; href: string; icon?: any }[];
  }[],
  commonplace: [
    {
      title: "Reading",
      subtitle: "Recent books that shaped my thinking.",
      items: ["The Antidote", "Being Mortal", "Stolen Focus"],
    },
    {
      title: "Philosophy",
      subtitle: "Principles I live by.",
      items: ["Stoicism", "Effective Altruism", "Incrementalism"],
    },
    {
      title: "Gear",
      subtitle: "Tools that help me work.",
      items: ["Keychron K2", "Logitech MX Master 3", "BenQ ScreenBar"],
    },
  ],
} as const;
