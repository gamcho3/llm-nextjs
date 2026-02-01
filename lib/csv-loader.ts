// lib/csv-loader.ts

import fs from "fs";
import path from "path";
import Papa from "papaparse";
import { JejuPlace } from "@/types";

// CSV 파일에서 제주 여행장소 데이터 로드
export async function loadJejuPlaces(): Promise<JejuPlace[]> {
  // CSV 파일 경로
  const csvPath = path.join(process.cwd(), "data", "jeju-places.csv");

  // 파일 읽기
  const csvContent = fs.readFileSync(csvPath, "utf-8");

  // CSV 파싱
  const result = Papa.parse(csvContent, {
    header: true, // 첫 줄을 컬럼명으로 사용
    skipEmptyLines: true, // 빈 줄 무시
  });

  // 데이터 변환
  const places: JejuPlace[] = result.data.map((row: any) => ({
    contentsId: row["장소아이디"] || "",
    name: row["장소명"] || "",
    address: row["지번주소"] || "",
    roadAddress: row["도로명주소"] || "",
    createdAt: row["등록일시"] || "",
    updatedAt: row["수정일시"] || "",
    latitude: parseFloat(row["위도"]) || 0,
    longitude: parseFloat(row["경도"]) || 0,
  }));

  // 유효한 데이터만 필터링 (이름이 있는 것만)
  return places.filter((place) => place.name && place.name.trim() !== "");
}

// 장소 데이터를 검색용 텍스트로 변환
export function placeToText(place: JejuPlace): string {
  const parts = [
    `장소명: ${place.name}`,
    place.address && `주소: ${place.address}`,
    place.roadAddress && `도로명주소: ${place.roadAddress}`,
    place.latitude &&
      place.longitude &&
      `위도: ${place.latitude}, 경도: ${place.longitude}`,
    place.createdAt && `등록일시: ${place.createdAt}`,
    place.updatedAt && `수정일시: ${place.updatedAt}`,
  ].filter(Boolean); // 빈 값 제거

  return parts.join("\n");
}
