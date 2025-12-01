"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Settings,
  Globe,
  Palette,
  Bell,
  Shield,
  Loader2,
  Save,
} from "lucide-react";

interface SiteSettings {
  site_name: string;
  site_description: string;
  logo_url: string;
  favicon_url: string;
  hero_title: string;
  hero_subtitle: string;
  hero_image_url: string;
  announcement_text: string;
  announcement_enabled: boolean;
  footer_text: string;
  social_instagram: string;
  social_tiktok: string;
  social_youtube: string;
  contact_email: string;
  shipping_info: string;
  return_policy: string;
  affiliate_disclosure: string;
}

const defaultSettings: SiteSettings = {
  site_name: "Miran Army",
  site_description:
    "The #1 Fan Community - Official AliExpress Affiliate Store",
  logo_url: "",
  favicon_url: "",
  hero_title: "Miran Army – The #1 Fan Community",
  hero_subtitle:
    "Support your faves with our exclusive merch drops. New arrivals every week!",
  hero_image_url: "",
  announcement_text: "🎉 FREE shipping on orders over $50!",
  announcement_enabled: true,
  footer_text:
    "© 2025 Miran Army. All rights reserved. We are not affiliated with any artists. Prices and availability subject to change.",
  social_instagram: "",
  social_tiktok: "",
  social_youtube: "",
  contact_email: "",
  shipping_info:
    "Most items ship directly from our partner sellers. Delivery typically takes 15-30 business days.",
  return_policy:
    "Returns are handled by individual sellers. Please contact the seller directly for return requests.",
  affiliate_disclosure:
    "As an AliExpress affiliate, we earn from qualifying purchases. Product prices may vary.",
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .single();

    if (data && !error) {
      setSettings({ ...defaultSettings, ...data });
    }
    setLoading(false);
  };

  const handleChange = (key: keyof SiteSettings, value: string | boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const supabase = createClient();

    // Upsert settings
    const { error } = await supabase.from("site_settings").upsert(
      {
        id: "main",
        ...settings,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    if (error) {
      console.error("Error saving settings:", error);
      alert("Error saving settings");
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-brand-yellow" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Settings className="h-8 w-8 text-brand-yellow" />
            <h1 className="font-heading text-2xl md:text-3xl font-bold text-text-main">
              Settings
            </h1>
          </div>
          <p className="text-text-muted">
            Configure your store settings and preferences
          </p>
        </div>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-brand-yellow text-brand-black hover:bg-brand-yellow/90"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : saved ? (
            <>
              <Save className="h-4 w-4 mr-2" />
              Saved!
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-white border border-gray-200 shadow-sm">
          <TabsTrigger value="general" className="gap-2">
            <Globe className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2">
            <Palette className="h-4 w-4" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="legal" className="gap-2">
            <Shield className="h-4 w-4" />
            Legal
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <div className="grid gap-6">
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle>Site Information</CardTitle>
                <CardDescription>
                  Basic information about your store
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="site_name">Site Name</Label>
                    <Input
                      id="site_name"
                      value={settings.site_name}
                      onChange={(e) =>
                        handleChange("site_name", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact_email">Contact Email</Label>
                    <Input
                      id="contact_email"
                      type="email"
                      value={settings.contact_email}
                      onChange={(e) =>
                        handleChange("contact_email", e.target.value)
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="site_description">Site Description</Label>
                  <Textarea
                    id="site_description"
                    value={settings.site_description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      handleChange("site_description", e.target.value)
                    }
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900">Social Media</CardTitle>
                <CardDescription>
                  Connect your social media accounts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="social_instagram">Instagram URL</Label>
                    <Input
                      id="social_instagram"
                      value={settings.social_instagram}
                      onChange={(e) =>
                        handleChange("social_instagram", e.target.value)
                      }
                      placeholder="https://instagram.com/..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="social_tiktok">TikTok URL</Label>
                    <Input
                      id="social_tiktok"
                      value={settings.social_tiktok}
                      onChange={(e) =>
                        handleChange("social_tiktok", e.target.value)
                      }
                      placeholder="https://tiktok.com/@..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="social_youtube">YouTube URL</Label>
                    <Input
                      id="social_youtube"
                      value={settings.social_youtube}
                      onChange={(e) =>
                        handleChange("social_youtube", e.target.value)
                      }
                      placeholder="https://youtube.com/..."
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance">
          <div className="grid gap-6">
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900">Branding</CardTitle>
                <CardDescription>
                  Customize your store's visual identity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="logo_url">Logo URL</Label>
                    <Input
                      id="logo_url"
                      value={settings.logo_url}
                      onChange={(e) => handleChange("logo_url", e.target.value)}
                      placeholder="https://..."
                    />
                    {settings.logo_url && (
                      <div className="mt-2 p-4 bg-gray-100 rounded-lg">
                        <img
                          src={settings.logo_url}
                          alt="Logo preview"
                          className="h-12 object-contain"
                        />
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="favicon_url">Favicon URL</Label>
                    <Input
                      id="favicon_url"
                      value={settings.favicon_url}
                      onChange={(e) =>
                        handleChange("favicon_url", e.target.value)
                      }
                      placeholder="https://..."
                    />
                    {settings.favicon_url && (
                      <div className="mt-2 p-4 bg-gray-100 rounded-lg">
                        <img
                          src={settings.favicon_url}
                          alt="Favicon preview"
                          className="h-8 w-8 object-contain"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900">Hero Section</CardTitle>
                <CardDescription>
                  Customize the homepage hero banner
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="hero_title">Hero Title</Label>
                  <Input
                    id="hero_title"
                    value={settings.hero_title}
                    onChange={(e) => handleChange("hero_title", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hero_subtitle">Hero Subtitle</Label>
                  <Textarea
                    id="hero_subtitle"
                    value={settings.hero_subtitle}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      handleChange("hero_subtitle", e.target.value)
                    }
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hero_image_url">Hero Image URL</Label>
                  <Input
                    id="hero_image_url"
                    value={settings.hero_image_url}
                    onChange={(e) =>
                      handleChange("hero_image_url", e.target.value)
                    }
                    placeholder="https://..."
                  />
                  {settings.hero_image_url && (
                    <div className="mt-2 relative aspect-video w-full max-w-md rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={settings.hero_image_url}
                        alt="Hero preview"
                        className="object-cover w-full h-full"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900">Footer</CardTitle>
                <CardDescription>Customize footer content</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="footer_text">Footer Text</Label>
                  <Textarea
                    id="footer_text"
                    value={settings.footer_text}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      handleChange("footer_text", e.target.value)
                    }
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications">
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900">Announcement Bar</CardTitle>
              <CardDescription>
                Show announcements at the top of your store
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Announcement Bar</Label>
                  <p className="text-sm text-text-muted">
                    Show a banner at the top of all pages
                  </p>
                </div>
                <Switch
                  checked={settings.announcement_enabled}
                  onCheckedChange={(checked: boolean) =>
                    handleChange("announcement_enabled", checked)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="announcement_text">Announcement Text</Label>
                <Input
                  id="announcement_text"
                  value={settings.announcement_text}
                  onChange={(e) =>
                    handleChange("announcement_text", e.target.value)
                  }
                  placeholder="🎉 FREE shipping on orders over $50!"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Legal Settings */}
        <TabsContent value="legal">
          <div className="grid gap-6">
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900">
                  Shipping Information
                </CardTitle>
                <CardDescription>
                  Shipping policy displayed to customers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={settings.shipping_info}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    handleChange("shipping_info", e.target.value)
                  }
                  rows={4}
                />
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900">Return Policy</CardTitle>
                <CardDescription>
                  Return policy displayed to customers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={settings.return_policy}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    handleChange("return_policy", e.target.value)
                  }
                  rows={4}
                />
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900">
                  Affiliate Disclosure
                </CardTitle>
                <CardDescription>
                  FTC-required affiliate disclosure
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={settings.affiliate_disclosure}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    handleChange("affiliate_disclosure", e.target.value)
                  }
                  rows={4}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
