/**
 * Preset workload and VM configurations for quick-start experiments.
 */

const WORKLOAD_PRESETS = {
  small: {
    id: 'small',
    name: 'Small Workload',
    description: '10 tasks – quick test run',
    taskCount: 10,
    tasks: Array.from({ length: 10 }, (_, i) => ({
      size: 1000 + Math.round(Math.random() * 4000),
      cpu: 500 + Math.round(Math.random() * 1500),
      memory: 256 + Math.round(Math.random() * 768),
    })),
  },
  medium: {
    id: 'medium',
    name: 'Medium Workload',
    description: '50 tasks – standard benchmark',
    taskCount: 50,
    tasks: Array.from({ length: 50 }, (_, i) => ({
      size: 2000 + Math.round(Math.random() * 8000),
      cpu: 500 + Math.round(Math.random() * 2500),
      memory: 256 + Math.round(Math.random() * 1792),
    })),
  },
  large: {
    id: 'large',
    name: 'Large Workload',
    description: '200 tasks – stress test',
    taskCount: 200,
    tasks: Array.from({ length: 200 }, (_, i) => ({
      size: 5000 + Math.round(Math.random() * 15000),
      cpu: 1000 + Math.round(Math.random() * 4000),
      memory: 512 + Math.round(Math.random() * 3584),
    })),
  },
  heterogeneous: {
    id: 'heterogeneous',
    name: 'Heterogeneous Mix',
    description: '100 tasks – mixed sizes (small + large)',
    taskCount: 100,
    tasks: Array.from({ length: 100 }, (_, i) => {
      const isHeavy = i % 3 === 0;
      return {
        size: isHeavy ? 10000 + Math.round(Math.random() * 10000) : 1000 + Math.round(Math.random() * 3000),
        cpu: isHeavy ? 3000 + Math.round(Math.random() * 2000) : 500 + Math.round(Math.random() * 1000),
        memory: isHeavy ? 2048 + Math.round(Math.random() * 2048) : 256 + Math.round(Math.random() * 512),
      };
    }),
  },
};

const VM_PRESETS = {
  uniform_small: {
    id: 'uniform_small',
    name: 'Uniform Small',
    description: '3 identical low-spec VMs',
    vmCount: 3,
    vms: Array.from({ length: 3 }, () => ({
      mips: 1000,
      ram: 2048,
      bw: 1000,
      storage: 10000,
    })),
  },
  uniform_medium: {
    id: 'uniform_medium',
    name: 'Uniform Medium',
    description: '5 identical mid-spec VMs',
    vmCount: 5,
    vms: Array.from({ length: 5 }, () => ({
      mips: 2000,
      ram: 4096,
      bw: 2000,
      storage: 20000,
    })),
  },
  uniform_large: {
    id: 'uniform_large',
    name: 'Uniform Large',
    description: '10 identical high-spec VMs',
    vmCount: 10,
    vms: Array.from({ length: 10 }, () => ({
      mips: 4000,
      ram: 8192,
      bw: 5000,
      storage: 50000,
    })),
  },
  heterogeneous: {
    id: 'heterogeneous',
    name: 'Heterogeneous Cluster',
    description: '8 VMs – mixed specs (2 tiers)',
    vmCount: 8,
    vms: [
      ...Array.from({ length: 4 }, () => ({
        mips: 1000,
        ram: 2048,
        bw: 1000,
        storage: 10000,
      })),
      ...Array.from({ length: 4 }, () => ({
        mips: 4000,
        ram: 8192,
        bw: 5000,
        storage: 50000,
      })),
    ],
  },
};

module.exports = { WORKLOAD_PRESETS, VM_PRESETS };
