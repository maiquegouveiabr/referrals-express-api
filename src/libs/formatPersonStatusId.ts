export const formatPersonStatusId = (id: number) => {
  if (id === 2) {
    return "🟢 BEING TAUGHT";
  } else if (id === 1) {
    return "🟡 INTERESTED";
  } else if (id === 20) {
    return "⚫ NOT INTERESTED";
  } else if (id === 23) {
    return "⚫ UNABLE TO CONTACT";
  } else if (id === 26) {
    return "⚫ NOT RECENTLY TAUGHT";
  } else if (id === 27) {
    return "⚫ TOO BUSY";
  } else if (id === 201) {
    return "⚫ MOVED, ADDRESS UNKNOWN";
  } else if (id === 28) {
    return "⚫ LIVES OUTSIDE CENTER OF STRENGTH";
  } else if (id === 22) {
    return "⚫ NOT PROGRESSING";
  } else {
    return "OTHER";
  }
};
