// lib/csvParser.ts

import Papa from "papaparse";
import fs from "fs";
import path from "path";
import { Place } from "@/types";

export function loadPlaces(): Place[] {
  // 1) CSV 파일 읽기
  const filePath = path.join(process.cwd(), "data", "jeju-places.csv");
  const csvText = fs.readFileSync(filePath, "utf-8");

  // 2) CSV → JavaScript 객체로 변환
  const { data } = Papa.parse(csvText, {
    header: true, // 첫 줄을 컬럼명으로 사용
    skipEmptyLines: true,
  });

  // 3) 필요한 필드만 골라서 정리
  const places: Place[] = (data as any[])
    .filter((row) => row["장소명"] && row["도로명주소"]) // 이름·주소 없는 행 제외
    .map((row) => ({
      name: row["장소명"]?.trim() || "",
      address: row["주소"]?.trim() || "",
      roadAddress: row["도로명주소"]?.trim() || "",
      latitude: parseFloat(row["위도"]) || 0,
      longitude: parseFloat(row["경도"]) || 0,
      createdAt: row["등록일시"]?.trim() || "",
      updatedAt: row["수정일시"]?.trim() || "",
    }));

  console.log(`✅ ${places.length}개 장소 로드 완료`);
  return places;
}

export function processCSVToDocuments() {
  const places = loadPlaces();
  return places.map((place, index) => ({
    pageContent: [
      `장소명: ${place.name}`,
      `주소: ${place.address}`,
      `도로명주소: ${place.roadAddress || ""}`,
    ].join("\n"),
    metadata: {
      id: index.toString(),
      name: place.name,
      address: place.address,
      roadAddress: place.roadAddress,
      latitude: place.latitude,
      longitude: place.longitude,
    },
  }));
}

export function filterByWeather(docs: any[], weather: any) {
  // Weather filtering logic - for now, return all docs
  // You can implement weather-based filtering here
  return docs;
}
