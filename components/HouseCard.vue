<template>
 <div class="p-4 border rounded shadow-md">
  <highcharts :options="options" />
  <h2 class="text-xl font-semibold mb-2">House {{ houseId }}</h2>
  <p v-if="houseUsage" class="text-sm text-gray-700">
   From
   {{ new Date(houseUsage.start_created_at).toLocaleDateString("de-DE") }}
   to
   {{ new Date(houseUsage.end_created_at).toLocaleDateString("de-DE") }}
  </p>
  <div v-if="houseUsage" class="flex justify-between items-center gap-2">
   <div>
    <div
     v-for="(value, key) in houseUsage"
     :key="key + value"
     class="mt-1 text-md text-gray-700"
    >
     <template v-if="isValidUsageKey(key)">
      <div v-if="attributeCostMap[key]" class="mr-1">
       {{ attributeLabelsMap[key] }}:
       <span>{{ Number(value) * attributeCostMap[key] }} THB</span>
      </div>
      <p class="text-xs text-gray-500">
       ({{ houseUsage[replacePrefix(key, "start")] }}
       -
       {{ houseUsage[replacePrefix(key, "end")] }}) = {{ value }} x
       {{ attributeCostMap[key] }} THB/Unit
      </p>
     </template>
    </div>
   </div>
   <div class="mt-2 text-lg">
    Total:
    {{
     Object.keys(houseUsage)
      .filter((key) => isValidUsageKey(key))
      .reduce((acc, key) => {
       return acc + houseUsage![key] * attributeCostMap[key];
      }, 0)
    }}
    THB
   </div>
  </div>
 </div>
</template>

<script lang="ts" setup>
import { attributeCostMap, attributeLabelsMap } from "~/constants";
import type { Reading, Usage, UsageKey, UsageKeyMap } from "~/types";

const props = defineProps<{
 houseId: number;
 houseUsage: Usage | undefined;
 dateRange: [string | undefined, string | undefined] | [];
 readings: Reading[];
 usage: Usage[];
}>();

const emit = defineEmits(["update:dateRange"]);

const dateRangeParent = computed({
 get: () => props.dateRange,
 set: (value: [string | undefined, string | undefined]) => {
  emit("update:dateRange", value);
 },
});

const isValidUsageKey = (key: keyof Usage | string): key is UsageKey => {
 return key.includes("usage_");
};

const selectDateRange = (date: string) => {
 const startDate = dateRangeParent.value[0];
 if (
  dateRangeParent.value.length === 0 ||
  (startDate && new Date(startDate) > new Date(date))
 ) {
  dateRangeParent.value = [date, undefined];
  return false;
 } else if (startDate && !dateRangeParent.value[1]) {
  dateRangeParent.value = [startDate, date];
  return true;
 } else if (dateRangeParent.value[1]) {
  dateRangeParent.value = [date, undefined];
  return false;
 }
};

const replacePrefix = (key: keyof Usage, prefix: "start" | "end") => {
 return key.replace(/(start|end|usage)/, prefix) as keyof Usage;
};
const options = computed<Highcharts.Options>(() => {
 const houseReadings = props.readings
  .filter((r) => r.house_id === props.houseId)
  .sort(
   (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

 return {
  chart: {
   type: "line",
  },
  title: {
   text: "",
  },
  xAxis: {
   categories: houseReadings.map((r) => r.created_at),
   title: {
    text: "Date",
   },
   plotBands: [
    {
     from: houseReadings.findIndex(
      (r) => r.created_at === props.houseUsage?.start_created_at
     ),
     to: houseReadings.findIndex(
      (r) => r.created_at === props.houseUsage?.end_created_at
     ),
     color: "rgba(68, 170, 213, 0.2)", // Color of the highlight
     label: {
      text: "",
      style: {
       color: "#606060",
      },
     },
    },
   ],
  },
  yAxis: {
   min: 0,
   title: {
    text: "Units",
   },
  },

  plotOptions: {
   series: {
    allowPointSelect: true,
    point: {
     events: {
      click: function () {
       this.select(selectDateRange(String(this.category)), true);
      },
     },
    },
   },
  },
  series: [
   {
    type: "line",
    name: "Electric Government",
    data: houseReadings.map((r) => r.electric_government),
   },
   {
    type: "line",
    name: "Electric Factory",
    data: houseReadings.map((r) => r.electric_factory),
   },
   {
    type: "line",
    name: "Water Factory",
    data: houseReadings.map((r) => r.water_factory),
   },
   {
    type: "line",
    name: "Water Private",
    data: houseReadings.map((r) => r.water_private),
   },
  ],
 };
});
</script>
