import { NextRequest, NextResponse } from "next/server";
import { getSubjectSuggestions, getTopicSuggestions } from "@/lib/suggestions/academicCatalog";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = (searchParams.get("type") || "subject").toLowerCase();
    const query = searchParams.get("query") || searchParams.get("q") || "";
    const subject = searchParams.get("subject") || "";
    const limit = parseInt(searchParams.get("limit") || "8", 10);

    if (type === "topic") {
      const result = getTopicSuggestions(subject, query, limit);
      return NextResponse.json({
        success: true,
        ...result
      }, {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120"
        }
      });
    }

    // Default to subject suggestions
    const result = getSubjectSuggestions(query, limit);
    return NextResponse.json({
      success: true,
      ...result
    }, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120"
      }
    });
  } catch (error: any) {
    console.error("Suggestions API error:", error);
    return NextResponse.json({
      success: false,
      error: error.message || "Failed to fetch suggestions"
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const type = (body.type || "subject").toLowerCase();
    const query = body.query || body.q || "";
    const subject = body.subject || "";
    const limit = typeof body.limit === "number" ? body.limit : 8;

    if (type === "topic") {
      const result = getTopicSuggestions(subject, query, limit);
      return NextResponse.json({
        success: true,
        ...result
      });
    }

    const result = getSubjectSuggestions(query, limit);
    return NextResponse.json({
      success: true,
      ...result
    });
  } catch (error: any) {
    console.error("Suggestions API error:", error);
    return NextResponse.json({
      success: false,
      error: error.message || "Failed to process suggestions request"
    }, { status: 500 });
  }
}
