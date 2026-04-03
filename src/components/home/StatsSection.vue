  <template>
      <section class="py-16 bg-gray-50">
          <div class="container mx-auto px-6">
              <div class="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
                  <div v-for="(stat, index) in stats" :key="index" ref="revealItems" class="fade-in">
                      <div class="text-4xl lg:text-5xl font-bold text-[#00C49F] mb-2">
                          {{ stat.value }}
                      </div>
                      <div class="text-gray-600">
                          {{ stat.label }}
                      </div>
                  </div>
              </div>
          </div>
      </section>
  </template>

  <script setup>
  import { ref, onMounted } from 'vue';
  import '../../assets/css/home.css';
  // Data for the stats
  const stats = [
      { value: '500+', label: 'Businesses Powered' },
      { value: '10M+', label: 'Calls Processed' },
      { value: '99.9%', label: 'Uptime Reliability' },
      { value: '4.8/5', label: 'Customer Rating' }
  ];

  // Animation Logic: Trigger "visible" class when scrolled into view
  const revealItems = ref([]);

  onMounted(() => {
      const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
              if (entry.isIntersecting) {
                  entry.target.classList.add('visible');
              }
          });
      }, { threshold: 0.1 });

      revealItems.value.forEach(item => {
          observer.observe(item);
      });
  });
  </script>

