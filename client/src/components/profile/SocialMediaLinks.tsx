import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Linkedin, 
  Twitter, 
  Facebook, 
  Instagram, 
  Github, 
  Youtube,
  ExternalLink,
  Plus,
  X
} from "lucide-react";

interface SocialMediaLinksProps {
  socialLinks: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
    github?: string;
    youtube?: string;
  };
  isEditing?: boolean;
  onLinksChange: (links: any) => void;
}

const socialPlatforms = [
  {
    key: 'linkedin',
    name: 'LinkedIn',
    icon: Linkedin,
    placeholder: 'https://linkedin.com/in/username',
    color: 'bg-blue-600 hover:bg-blue-700',
    textColor: 'text-blue-600'
  },
  {
    key: 'twitter',
    name: 'Twitter',
    icon: Twitter,
    placeholder: 'https://twitter.com/username',
    color: 'bg-sky-500 hover:bg-sky-600',
    textColor: 'text-sky-500'
  },
  {
    key: 'facebook',
    name: 'Facebook',
    icon: Facebook,
    placeholder: 'https://facebook.com/username',
    color: 'bg-blue-500 hover:bg-blue-600',
    textColor: 'text-blue-500'
  },
  {
    key: 'instagram',
    name: 'Instagram',
    icon: Instagram,
    placeholder: 'https://instagram.com/username',
    color: 'bg-pink-500 hover:bg-pink-600',
    textColor: 'text-pink-500'
  },
  {
    key: 'github',
    name: 'GitHub',
    icon: Github,
    placeholder: 'https://github.com/username',
    color: 'bg-gray-800 hover:bg-gray-900',
    textColor: 'text-gray-800'
  },
  {
    key: 'youtube',
    name: 'YouTube',
    icon: Youtube,
    placeholder: 'https://youtube.com/c/channelname',
    color: 'bg-red-500 hover:bg-red-600',
    textColor: 'text-red-500'
  }
];

export function SocialMediaLinks({ socialLinks, isEditing = false, onLinksChange }: SocialMediaLinksProps) {
  const [tempLinks, setTempLinks] = useState(socialLinks || {});

  const handleLinkChange = (platform: string, value: string) => {
    const updatedLinks = {
      ...tempLinks,
      [platform]: value || undefined // Use undefined to remove empty strings
    };
    setTempLinks(updatedLinks);
    onLinksChange(updatedLinks);
  };

  const validateUrl = (url: string) => {
    if (!url) return true;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const getDisplayLinks = () => {
    return Object.entries(socialLinks || {})
      .filter(([_, url]) => url && url.trim() !== '')
      .map(([platform, url]) => ({
        platform,
        url,
        config: socialPlatforms.find(p => p.key === platform)
      }));
  };

  if (!isEditing) {
    const displayLinks = getDisplayLinks();
    
    if (displayLinks.length === 0) {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Social Media</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 text-sm">No social media links added yet.</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Social Media</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {displayLinks.map(({ platform, url, config }) => {
              if (!config) return null;
              const IconComponent = config.icon;
              
              return (
                <Badge
                  key={platform}
                  variant="secondary"
                  className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100"
                  onClick={() => window.open(url, '_blank')}
                >
                  <IconComponent className={`h-4 w-4 ${config.textColor}`} />
                  <span className="text-sm">{config.name}</span>
                  <ExternalLink className="h-3 w-3 text-gray-400" />
                </Badge>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Social Media Links</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {socialPlatforms.map((platform) => {
            const IconComponent = platform.icon;
            const currentValue = tempLinks[platform.key as keyof typeof tempLinks] || '';
            const isValid = validateUrl(currentValue);

            return (
              <div key={platform.key} className="space-y-2">
                <Label 
                  htmlFor={platform.key}
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  <IconComponent className={`h-4 w-4 ${platform.textColor}`} />
                  {platform.name}
                </Label>
                <div className="relative">
                  <Input
                    id={platform.key}
                    type="url"
                    placeholder={platform.placeholder}
                    value={currentValue}
                    onChange={(e) => handleLinkChange(platform.key, e.target.value)}
                    className={!isValid && currentValue ? "border-red-300 focus:border-red-500" : ""}
                  />
                  {currentValue && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                      onClick={() => handleLinkChange(platform.key, '')}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {!isValid && currentValue && (
                  <p className="text-sm text-red-500">Please enter a valid URL</p>
                )}
              </div>
            );
          })}
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Add your social media profiles to help others connect with you professionally.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}