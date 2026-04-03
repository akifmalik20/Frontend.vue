<template>
  <div id="landingPage">
    <Navbar />
    <HeroSection
        title="Revolutionize Customer Experience with"
        highlightedText="AI-Powered"
        subtitle=" Communication"
        description="Automate voice, chat, and analytics on one secure platform."
        :primaryCta="{ label: 'Start Free Trial', link: { path: '/', hash: '#pricing' } }"
        :secondaryCta="{ label: 'View Demo', link: { path: '/', hash: '#features' } }"
        :benefits="[
          'No credit card required',
          '14-day free trial',
          'Setup in 5 minutes'
        ]"
        :stats="[
          { label: 'Active Calls', subtext: '24 calls in progress', value: '+12%', icon: 'fa-solid fa-headset', bgColor: 'bg-[#00C49F]' },
          { label: 'AI Agents', subtext: '18 agents active', value: '94%', icon: 'fa-solid fa-robot', bgColor: 'bg-[#FFB039]' },
          { label: 'Satisfaction', subtext: '4.8/5 rating', value: '+8%', icon: 'fa-solid fa-chart-line', bgColor: 'bg-purple-500' }
        ]"
    />

    <!-- Add Progress Line Here -->
    <ProgressLine />

    <StatsSection/>
    <FeatureSection id="features"/>
    <ServiceSection id="services"/>
    <PriceSection id="pricing"/>
    <AboutSection id="about"/>
    <RoadmapSection id="roadmap"/>
    <CtoSection/>
    <FooterSection/>
  </div>
</template>

<script>
import NavBarbar from "@/components/NavBar.vue";
import HeroSection from "@/components/home/HeroSection.vue";
import StatsSection from '@/components/home/StatsSection.vue';
import FeatureSection from '@/components/home/FeatureSection.vue';
import ServiceSection from '@/components/home/ServiceSection.vue';
import PricingSection from '@/components/home/PricingSection.vue';
import AboutSection from '@/components/home/AboutSection.vue';
import RoadMapSection from '@/components/home/RoadMapSection.vue';
import CustExperienceSection from '@/components/home/CustExperienceSection.vue';
import FooterSection from '@/components/home/FooterSection.vue';
import ProgressLine from '@/components/home/ProgressLine.vue'; // Import the new component

import "@/assets/css/home.css";
import { nextTick, onMounted } from "vue";

export default {
  name: "LandingPage",
  components: {
    ProgressLine, // Add to components
    FeatureSection,
    HeroSection,
    Navbar: NavBarbar,
    StatsSection,
    ServiceSection,
    PriceSection: PricingSection,
    AboutSection,
    RoadmapSection: RoadMapSection,
    CtoSection: CustExperienceSection,
    FooterSection
  }
};

onMounted(async () => {
  // Wait for child components to render
  await nextTick();

  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.reveal-card').forEach(el => observer.observe(el));
});
</script>