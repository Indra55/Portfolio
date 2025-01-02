import { Sun, Mail, Github, Linkedin } from 'lucide-react'

export default function SocialLinks() {
  const socialLinks = [
    {
        platform: "Email",
        username: "Email",
        icon: <Mail className="h-5 w-5" />,
        href: "mailto:galahitanshu@gmail.com"
      },
    {
      platform: "GitHub",
      username: "Indra55",
      icon: <Github className="h-5 w-5" />,
      href: "https://github.com/indra55"
    },
    {
      platform: "LinkedIn",
      username: "@hitanshu",
      icon: <Linkedin className="h-5 w-5" />,
      href: "https://www.linkedin.com/in/hitanshu-gala-9a14b0155/"
    }
  ]

  return (
    <div style={{ width: '226px', height: '278px' }} className="  w-44 bg-[rgba(255, 255, 255, 0.1)] backdrop-blur-md rounded-x text-white ">
      <div className="p-6 pb-2 space-y-4 flex flex-col">
        <div className="flex items-center gap-2 text-zinc-100">
          <Sun className="h-5 w-5 text-[#f8c3b8]" />
          <span className="text-[#f8c3b8] font-[Silkscreen]">Connect</span>
        </div>
        <h2 className="text-xl font-semibold">Online Presence</h2>
      </div>
      <div className="px-6 pb-6 space-y-4 flex-grow flex flex-col justify-between">
        {socialLinks.map((link) => (
          <a
            key={link.platform}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-md bg-zinc-800/50 p-3 transition-colors hover:bg-zinc-800"
          >
            {link.icon}
            <span className="text-sm text-zinc-300">{link.username}</span>
          </a>
        ))}
      </div>
    </div>
  )
}

