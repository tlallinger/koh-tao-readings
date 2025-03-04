<template>
 <div class="container mx-auto p-4">
  <h1 class="text-2xl font-bold mb-4">Meter Readings Over Time</h1>
  <div class="mb-4 flex items-center">
   <label for="start-date" class="mr-2">Start Date:</label>
   <input
    type="date"
    id="start-date"
    v-model="dateRange[0]"
    class="border rounded px-2 py-1"
   />

   <label for="end-date" class="ml-4 mr-2">End Date:</label>
   <input
    type="date"
    id="end-date"
    v-model="dateRange[1]"
    class="border rounded px-2 py-1"
   />
  </div>

  <div class="grid lg:grid-cols-2 grid-cols-1 gap-4">
   <HouseCard
    v-for="houseId in houseIds"
    :key="houseId"
    v-model:dateRange="dateRange"
    v-model:usage="usage"
    :houseId="houseId"
    :houseUsage="houseUsageMap[houseId]"
    :readings="readings"
    class="p-4 border rounded shadow-md"
   />
   <div
    v-if="dateRange[0] && dateRange[1]"
    v-for="card in totalCards"
    class="p-4 border rounded shadow-md"
   >
    <h2 class="text-xl font-semibold mb-2">{{ card.title }}</h2>

    <p class="text-sm text-gray-700">
     From
     {{ new Date(dateRange[0]).toLocaleDateString("de-DE") }}
     to
     {{ new Date(dateRange[1]).toLocaleDateString("de-DE") }}
    </p>
    <div class="flex flex-col gap-2 mt-2">
     <div v-for="attribute in card.attributes" :key="attribute">
      {{ attributeLabelsMap[attribute] }}:
      <div v-for="houseId in houseIds" :key="houseId">
       <div v-if="houseUsageMap[houseId]">
        House {{ houseId }}:
        {{ houseUsageMap[houseId][replacePrefix(attribute, "start")] }} -
        {{ houseUsageMap[houseId][replacePrefix(attribute, "end")] }} =
        {{ houseUsageMap[houseId][attribute] }}
       </div>
      </div>
     </div>

     <div>Total:</div>
     <div v-for="attribute in card.attributes" :key="attribute + 'total'">
      {{ attributeLabelsMap[attribute] }}: {{ getTotalUsage(attribute) }} x
      {{ attributeCostMap[attribute] }} THB =
      {{ getTotalUsage(attribute) * attributeCostMap[attribute] }}
      THB
     </div>
    </div>
   </div>
  </div>
 </div>
</template>
<script setup lang="ts">
import { createClient } from "@supabase/supabase-js";
import HouseCard from "./components/HouseCard.vue";
import { attributeCostMap, attributeLabelsMap } from "~/constants";
import type { Reading, Usage, UsageKey } from "./types";

const config = useRuntimeConfig();
const supabase = createClient(
 config.public.supabaseUrl,
 config.public.supabaseAnonKey
);

const totalCards: { title: string; attributes: UsageKey[] }[] = [
 {
  title: "Factory Bill",
  attributes: ["usage_factory_electric", "usage_factory_water"],
 },
 {
  title: "Total Usage",
  attributes: ["usage_gov_electric", "usage_backup_water"],
 },
];

const ONE_MONTH = 30 * 24 * 60 * 60 * 1000;
const SIX_MONTH = 6 * 30 * 24 * 60 * 60 * 1000;
const sixMonthAgo = new Date(new Date().getTime() - SIX_MONTH);

const readings = (
 await supabase
  .from("readings")
  .select("*")
  .gt("created_at", sixMonthAgo.toISOString())
).data as Reading[];

const usage = ref<Usage[]>([]);

const findHighestCreatedAt = () => {
 const MIN_DATE = new Date(0);

 return readings.reduce((maxDate, reading) => {
  const currentDate = new Date(reading.created_at);
  return currentDate > maxDate ? currentDate : maxDate;
 }, MIN_DATE);
};

const dateRange = ref<[string | undefined, string | undefined] | []>([
 new Date(findHighestCreatedAt().getTime() - ONE_MONTH)
  .toISOString()
  .split("T")[0],
 findHighestCreatedAt().toISOString().split("T")[0],
]);

const houseIds = computed(() => {
 return [...new Set(readings?.map((r) => r.house_id))];
});

const houseUsageMap = computed(() => {
 const usageByHouse: Record<number, Usage> = {};
 houseIds.value.forEach((houseId) => {
  usageByHouse[houseId] = usage.value.find(
   (u) => u.house_id === houseId
  ) as Usage;
 });
 return usageByHouse;
});

const getUsage = async () => {
 if (dateRange.value[0] && dateRange.value[1]) {
  const { data } = await supabase.rpc("calculate_usage", {
   from_date: dateRange.value[0],
   to_date: dateRange.value[1],
  });
  usage.value = data.usage_data;
 }
};

watch(dateRange, getUsage, { deep: true, immediate: true });

const getTotalUsage = (key: keyof Usage) => {
 return usage.value.reduce((acc, u) => acc + Number(u[key]), 0);
};
</script>
