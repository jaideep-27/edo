package com.edocloud.simulator;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;

import org.cloudsimplus.brokers.DatacenterBrokerSimple;
import org.cloudsimplus.cloudlets.Cloudlet;
import org.cloudsimplus.cloudlets.CloudletSimple;
import org.cloudsimplus.core.CloudSimPlus;
import org.cloudsimplus.datacenters.DatacenterSimple;
import org.cloudsimplus.hosts.Host;
import org.cloudsimplus.hosts.HostSimple;
import org.cloudsimplus.resources.Pe;
import org.cloudsimplus.resources.PeSimple;
import org.cloudsimplus.schedulers.cloudlet.CloudletSchedulerTimeShared;
import org.cloudsimplus.schedulers.vm.VmSchedulerTimeShared;
import org.cloudsimplus.vms.Vm;
import org.cloudsimplus.vms.VmSimple;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * CloudSim Plus runner for EDO-Cloud Scheduler.
 * <p>
 * Reads a JSON configuration from stdin, runs the simulation,
 * and writes results to stdout as JSON.
 * </p>
 *
 * Input JSON:
 * {
 *   "experimentId": "...",
 *   "schedule": [{"taskId":0,"vmId":1}, ...],
 *   "vmConfig": {"vmCount":3, "vms":[{"id":0,"mips":1000,"ram":2048,"bandwidth":1000}, ...]}
 * }
 *
 * Output JSON:
 * {
 *   "makespan": 12.5,
 *   "energy": 45.3,
 *   "avgResponseTime": 8.2,
 *   "resourceUtilization": 0.85,
 *   "taskResults": [{"taskId":0,"vmId":1,"startTime":0.0,"endTime":3.5}, ...]
 * }
 */
public class CloudSimRunner {

    public static void main(String[] args) {
        try {
            // Read JSON from stdin
            BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
            String input = reader.lines().collect(Collectors.joining());
            reader.close();

            Gson gson = new Gson();
            JsonObject config = gson.fromJson(input, JsonObject.class);

            JsonObject vmConfigObj = config.getAsJsonObject("vmConfig");
            JsonArray scheduleArr = config.getAsJsonArray("schedule");
            JsonArray vmsArr = vmConfigObj.getAsJsonArray("vms");
            int vmCount = vmConfigObj.get("vmCount").getAsInt();

            // --- Build CloudSim simulation ---
            CloudSimPlus simulation = new CloudSimPlus();
            DatacenterBrokerSimple broker = new DatacenterBrokerSimple(simulation);

            // Create hosts (one powerful host that can accommodate all VMs)
            List<Pe> peList = new ArrayList<>();
            for (int i = 0; i < vmCount * 4; i++) {
                peList.add(new PeSimple(10000));
            }
            Host host = new HostSimple(
                vmCount * 8192L,  // RAM
                1000000L,          // Storage
                vmCount * 10000L,  // Bandwidth
                peList
            );
            host.setVmScheduler(new VmSchedulerTimeShared());

            DatacenterSimple datacenter = new DatacenterSimple(simulation, List.of(host));

            // Create VMs from config
            List<Vm> vmList = new ArrayList<>();
            for (int i = 0; i < vmCount; i++) {
                JsonObject vmJson = vmsArr.get(i).getAsJsonObject();
                int mips = vmJson.get("mips").getAsInt();
                int ram = vmJson.has("ram") ? vmJson.get("ram").getAsInt() : 2048;
                int bw = vmJson.has("bandwidth") ? vmJson.get("bandwidth").getAsInt() : 1000;

                Vm vm = new VmSimple(mips, 2); // 2 PEs per VM
                vm.setRam(ram).setBw(bw).setSize(10000);
                vm.setCloudletScheduler(new CloudletSchedulerTimeShared());
                vmList.add(vm);
            }
            broker.submitVmList(vmList);

            // Create cloudlets (tasks) and bind to VMs based on schedule
            List<Cloudlet> cloudletList = new ArrayList<>();
            for (int i = 0; i < scheduleArr.size(); i++) {
                JsonObject entry = scheduleArr.get(i).getAsJsonObject();
                int taskId = entry.get("taskId").getAsInt();
                int vmId = entry.get("vmId").getAsInt();

                // Task length defaults to random if not in config
                long length = 10000; // Default
                if (vmConfigObj.has("tasks")) {
                    // If task details are provided
                }

                Cloudlet cloudlet = new CloudletSimple(length, 1); // 1 PE required
                cloudlet.setFileSize(300).setOutputSize(300);
                cloudletList.add(cloudlet);

                // Bind cloudlet to specific VM
                broker.bindCloudletToVm(cloudlet, vmList.get(vmId % vmCount));
            }
            broker.submitCloudletList(cloudletList);

            // Run simulation
            simulation.start();

            // Collect results
            List<Cloudlet> finishedCloudlets = broker.getCloudletFinishedList();

            double makespan = 0;
            double totalExecTime = 0;
            JsonArray taskResults = new JsonArray();

            for (Cloudlet cl : finishedCloudlets) {
                double endTime = cl.getExecStartTime() + cl.getActualCpuTime();
                if (endTime > makespan) {
                    makespan = endTime;
                }
                totalExecTime += cl.getActualCpuTime();

                JsonObject taskResult = new JsonObject();
                taskResult.addProperty("taskId", (int) cl.getId());
                taskResult.addProperty("vmId", (int) cl.getVm().getId());
                taskResult.addProperty("startTime", cl.getExecStartTime());
                taskResult.addProperty("endTime", endTime);
                taskResult.addProperty("cpuTime", cl.getActualCpuTime());
                taskResults.add(taskResult);
            }

            double avgResponseTime = finishedCloudlets.isEmpty()
                ? 0 : totalExecTime / finishedCloudlets.size();

            // Simple resource utilization estimate
            double utilization = finishedCloudlets.isEmpty()
                ? 0 : totalExecTime / (makespan * vmCount);

            // Simplified energy model
            double energy = totalExecTime * 0.5; // 0.5 watts per unit of CPU time

            // Build output JSON
            JsonObject output = new JsonObject();
            output.addProperty("makespan", Math.round(makespan * 10000.0) / 10000.0);
            output.addProperty("energy", Math.round(energy * 10000.0) / 10000.0);
            output.addProperty("avgResponseTime", Math.round(avgResponseTime * 10000.0) / 10000.0);
            output.addProperty("resourceUtilization", Math.round(utilization * 10000.0) / 10000.0);
            output.add("taskResults", taskResults);

            // Write result to stdout
            System.out.println(gson.toJson(output));

        } catch (Exception e) {
            JsonObject error = new JsonObject();
            error.addProperty("error", e.getMessage());
            System.err.println(new Gson().toJson(error));
            System.exit(1);
        }
    }
}
