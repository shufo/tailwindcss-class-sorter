import * as b from "benny";
import { sortClasses } from "../dist/main.js";

b.suite(
  "sort benchmark",

  b.add("sort 2 classes", () => {
    sortClasses("pt-4 p-2");
  }),

  b.add("sort many classes", () => {
    sortClasses(
      "prose lg:prose-xl foo container z-10 z-20 z-50 justify-center text-left md:text-centerddk"
    );
  }),

  b.cycle(),
  b.complete(),
  b.save({ file: "reduce", version: "1.0.0" }),
  b.save({ file: "reduce", format: "chart.html" })
);
