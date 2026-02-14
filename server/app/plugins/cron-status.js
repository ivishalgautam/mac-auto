import fp from "fastify-plugin";

export default fp(async (fastify) => {
  // Debug endpoint to see scheduler structure
  fastify.get("/cron-debug", async () => {
    const scheduler = fastify.scheduler;

    if (!scheduler) {
      return {
        schedulerExists: false,
        error: "Scheduler not found on fastify instance",
      };
    }

    const allJobs = scheduler.getAllJobs?.() || [];
    return {
      schedulerExists: true,
      schedulerType: scheduler.constructor.name,
      schedulerKeys: Object.keys(scheduler),
      totalJobs: allJobs.length,
      jobs: allJobs.map((job) => ({
        id: job?.id,
        type: job?.constructor.name,
      })),
    };
  });

  // Main status endpoint
  fastify.get("/cron-status", async () => {
    try {
      const scheduler = fastify.scheduler;

      if (!scheduler) {
        return {
          error: "Scheduler not found on fastify instance",
          available: false,
        };
      }

      const allJobs = scheduler.getAllJobs?.() || [];

      const jobs = allJobs.map((job) => ({
        id: job?.id || "unknown",
        name: job?.task?.name || job?.taskName || job?.id || "Unknown",
        nextRun: job?.nextRun?.() || null,
        isRunning: job?.isRunning?.() || false,
        status: job?.isRunning?.() ? "running" : "scheduled",
        type: job?.constructor.name,
      }));

      return {
        total: jobs.length,
        jobs: jobs,
        available: true,
      };
    } catch (error) {
      return {
        error: error.message,
        available: false,
      };
    }
  });

  // Get detailed job info
  fastify.get("/cron-jobs", async () => {
    try {
      const scheduler = fastify.scheduler;
      const allJobs = scheduler?.getAllJobs?.() || [];

      const jobs = allJobs.map((job) => ({
        id: job?.id,
        name: job?.task?.name || job?.taskName || job?.id,
        nextRun: job?.nextRun?.(),
        isRunning: job?.isRunning?.(),
        type: job?.constructor.name,
        createdAt: job?.createdAt || "Unknown",
      }));

      return {
        count: jobs.length,
        jobs: jobs,
      };
    } catch (error) {
      return { error: error.message };
    }
  });

  // Stop a specific job
  fastify.post("/cron-jobs/:jobId/stop", async (request) => {
    try {
      const { jobId } = request.params;
      const scheduler = fastify.scheduler;

      const exists = scheduler?.existsById?.(jobId);
      if (!exists) {
        return {
          success: false,
          error: `Job with ID ${jobId} not found`,
        };
      }

      scheduler.stopById(jobId);
      return {
        success: true,
        message: `Job ${jobId} stopped`,
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Start a specific job
  fastify.post("/cron-jobs/:jobId/start", async (request) => {
    try {
      const { jobId } = request.params;
      const scheduler = fastify.scheduler;

      const exists = scheduler?.existsById?.(jobId);
      if (!exists) {
        return {
          success: false,
          error: `Job with ID ${jobId} not found`,
        };
      }

      scheduler.startById(jobId);
      return {
        success: true,
        message: `Job ${jobId} started`,
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Get summary of all jobs
  fastify.get("/cron-summary", async () => {
    try {
      const scheduler = fastify.scheduler;
      const allJobs = scheduler?.getAllJobs?.() || [];

      const runningJobs = allJobs.filter((job) => job.isRunning?.());
      const stoppedJobs = allJobs.filter((job) => !job.isRunning?.());

      return {
        total: allJobs.length,
        running: runningJobs.length,
        stopped: stoppedJobs.length,
        runningJobs: runningJobs.map((job) => ({
          id: job?.id,
          name: job?.task?.name || job?.taskName || job?.id,
        })),
        stoppedJobs: stoppedJobs.map((job) => ({
          id: job?.id,
          name: job?.task?.name || job?.taskName || job?.id,
        })),
      };
    } catch (error) {
      return { error: error.message };
    }
  });

  // Get jobs by status
  fastify.get("/cron-jobs/status/:status", async (request) => {
    try {
      const { status } = request.params;
      const scheduler = fastify.scheduler;

      const jobsByStatus = scheduler?.getAllJobsByStatus?.(status) || [];

      return {
        status: status,
        count: jobsByStatus.length,
        jobs: jobsByStatus.map((job) => ({
          id: job?.id,
          name: job?.task?.name || job?.taskName || job?.id,
          nextRun: job?.nextRun?.(),
        })),
      };
    } catch (error) {
      return { error: error.message };
    }
  });
});
