import type { Sport, Verdict } from './types';

export type Language = 'en' | 'vi';

type TranslationKey =
  | 'app.kicker'
  | 'app.title'
  | 'app.subtitle'
  | 'app.stepSport'
  | 'quick.kicker'
  | 'quick.title'
  | 'quick.body'
  | 'quick.step1.title'
  | 'quick.step1.body'
  | 'quick.step2.title'
  | 'quick.step2.body'
  | 'quick.step3.title'
  | 'quick.step3.body'
  | 'location.kicker'
  | 'location.title'
  | 'location.body'
  | 'location.placeholder'
  | 'location.search'
  | 'location.error'
  | 'location.tapResult'
  | 'empty.noLocation.title'
  | 'empty.noLocation.body'
  | 'empty.noWindow.title'
  | 'empty.noWindow.body'
  | 'empty.api.title'
  | 'empty.api.body'
  | 'verdict.kicker'
  | 'verdict.at'
  | 'verdict.bestWindow'
  | 'verdict.weatherDrag'
  | 'verdict.offline'
  | 'verdict.why'
  | 'verdict.share'
  | 'verdict.copied'
  | 'windows.kicker'
  | 'windows.title'
  | 'windows.body'
  | 'hourly.kicker'
  | 'hourly.title'
  | 'hourly.body'
  | 'hourly.feels'
  | 'hourly.rain'
  | 'hourly.wind'
  | 'prefs.kicker'
  | 'prefs.title'
  | 'prefs.body'
  | 'prefs.start'
  | 'prefs.end'
  | 'prefs.wind'
  | 'prefs.heat'
  | 'prefs.sun'
  | 'saved.kicker'
  | 'saved.title'
  | 'saved.body'
  | 'saved.empty'
  | 'saved.goto'
  | 'loading'
  | 'footer.built'
  | 'footer.website'
  | 'footer.blog'
  | 'footer.donate'
  | 'donation.kicker'
  | 'donation.title'
  | 'donation.close'
  | 'donation.alt'
  | 'donation.body'
  | 'language.label'
  | 'language.english'
  | 'language.vietnamese'
  | 'date.label'
  | 'date.selected'
  | 'date.pick'
  | 'date.today'
  | 'share.prefix'
  | 'share.for'
  | 'share.in'
  | 'share.bestWindow'
  | 'share.score';

const translations: Record<Language, Record<TranslationKey, string>> = {
  en: {
    'app.kicker': 'Court check',
    'app.title': 'Play or Pass',
    'app.subtitle': 'find out if outdoor pickleball, tennis, or basketball is worth playing today.',
    'app.stepSport': 'Step 1: choose sport',
    'quick.kicker': 'What is this?',
    'quick.title': 'A quick weather call for outdoor courts.',
    'quick.body': 'Play or Pass checks rain, wind, gusts, heat, UV, and weather conditions so you know if today is worth the trip.',
    'quick.step1.title': 'Pick your sport',
    'quick.step1.body': 'Different sports handle wind, heat, and rain differently.',
    'quick.step2.title': 'Choose a location',
    'quick.step2.body': 'Search your city or tap a saved court spot.',
    'quick.step3.title': 'Get the call',
    'quick.step3.body': 'See Play, Maybe, or Pass plus the best 2-hour window.',
    'location.kicker': 'Where?',
    'location.title': 'Pick a court spot',
    'location.body': 'Start with the city where you plan to play today.',
    'location.placeholder': 'City, park, or neighborhood',
    'location.search': 'Search locations',
    'location.error': "Couldn't grab that spot. Try again in a sec.",
    'location.tapResult': 'Tap a result to save it',
    'empty.noLocation.title': 'Choose a spot first',
    'empty.noLocation.body': 'Pick a sport above, then search a city on the left. Once you choose a result, your Play or Pass call shows here.',
    'empty.noWindow.title': 'Rough court day',
    'empty.noWindow.body': 'Nothing in your play hours looks friendly enough right now.',
    'empty.api.title': 'Weather feed missed',
    'empty.api.body': 'Open-Meteo did not answer this time. Try again in a bit.',
    'verdict.kicker': "Today's call",
    'verdict.at': 'at',
    'verdict.bestWindow': 'Best window',
    'verdict.weatherDrag': 'Weather drag',
    'verdict.offline': 'Offline, showing the last saved forecast.',
    'verdict.why': 'Why this call?',
    'verdict.share': 'Share the call',
    'verdict.copied': 'Copied',
    'windows.kicker': 'Best window',
    'windows.title': 'Top 3 court times',
    'windows.body': 'Higher scores mean fewer weather headaches.',
    'hourly.kicker': 'Hourly',
    'hourly.title': 'Court-by-court feel',
    'hourly.body': 'Use this when you want to compare each hour yourself.',
    'hourly.feels': 'feels',
    'hourly.rain': 'rain',
    'hourly.wind': 'wind',
    'prefs.kicker': 'Your style',
    'prefs.title': 'Tune the vibe',
    'prefs.body': 'Adjust this if you are picky about wind, heat, sun, or play times.',
    'prefs.start': 'Start after',
    'prefs.end': 'Wrap by',
    'prefs.wind': 'Wind sensitivity',
    'prefs.heat': 'Heat tolerance',
    'prefs.sun': 'UV tolerance',
    'saved.kicker': 'Saved spots',
    'saved.title': 'Your regular courts',
    'saved.body': 'Saved locations stay on this device.',
    'saved.empty': 'No regular courts yet. Search above and tap a result to save one.',
    'saved.goto': 'Go-to',
    loading: 'Checking the sky, wind, and court mood...',
    'footer.built': 'Built by Hien Tran. Weather by Open-Meteo.',
    'footer.website': 'Personal website',
    'footer.blog': 'Personal blog',
    'footer.donate': 'Donate',
    'donation.kicker': 'Thanks',
    'donation.title': 'Scan to support',
    'donation.close': 'Close donation modal',
    'donation.alt': 'Donation QR code',
    'donation.body': 'Much appreciated. Now go win the next point.',
    'language.label': 'Language',
    'language.english': 'English',
    'language.vietnamese': 'Vietnamese',
    'date.label': 'Today',
    'date.selected': 'Game day',
    'date.pick': 'Pick date',
    'date.today': 'Today',
    'share.prefix': 'Play or Pass',
    'share.for': 'for',
    'share.in': 'in',
    'share.bestWindow': 'Best window',
    'share.score': 'Score'
  },
  vi: {
    'app.kicker': 'Kiểm tra sân',
    'app.title': 'Chơi hay nghỉ?',
    'app.subtitle': 'xem hôm nay có nên chơi pickleball, tennis hoặc bóng rổ ngoài trời không.',
    'app.stepSport': 'Bước 1: chọn môn chơi',
    'quick.kicker': 'Ứng dụng này làm gì?',
    'quick.title': 'Gợi ý nhanh cho buổi chơi ngoài trời.',
    'quick.body': 'Chơi hay nghỉ kiểm tra mưa, gió, gió giật, nhiệt độ cảm nhận, UV và tình trạng thời tiết để bạn biết hôm nay có đáng ra sân không.',
    'quick.step1.title': 'Chọn môn chơi',
    'quick.step1.body': 'Mỗi môn chịu mưa, gió và nắng nóng khác nhau.',
    'quick.step2.title': 'Chọn địa điểm',
    'quick.step2.body': 'Tìm thành phố hoặc chọn sân đã lưu.',
    'quick.step3.title': 'Xem kết quả',
    'quick.step3.body': 'Nhận Chơi, Cân nhắc hoặc Nghỉ cùng khung giờ đẹp nhất 2 tiếng.',
    'location.kicker': 'Ở đâu?',
    'location.title': 'Chọn nơi chơi',
    'location.body': 'Bắt đầu bằng thành phố nơi bạn định chơi hôm nay.',
    'location.placeholder': 'Thành phố, công viên hoặc khu vực',
    'location.search': 'Tìm địa điểm',
    'location.error': 'Chưa tìm được địa điểm này. Thử lại sau một chút.',
    'location.tapResult': 'Bấm vào kết quả để lưu',
    'empty.noLocation.title': 'Chọn địa điểm trước',
    'empty.noLocation.body': 'Chọn môn chơi phía trên, rồi tìm thành phố bên trái. Sau khi chọn kết quả, gợi ý Chơi hay nghỉ sẽ hiện ở đây.',
    'empty.noWindow.title': 'Hôm nay hơi khó chơi',
    'empty.noWindow.body': 'Trong khung giờ bạn thích hiện chưa có lúc nào đủ ổn để ra sân.',
    'empty.api.title': 'Chưa lấy được thời tiết',
    'empty.api.body': 'Open-Meteo chưa phản hồi lần này. Thử lại sau một chút.',
    'verdict.kicker': 'Gợi ý hôm nay',
    'verdict.at': 'tại',
    'verdict.bestWindow': 'Khung giờ đẹp nhất',
    'verdict.weatherDrag': 'Rủi ro thời tiết',
    'verdict.offline': 'Đang ngoại tuyến, hiển thị dự báo đã lưu gần nhất.',
    'verdict.why': 'Vì sao?',
    'verdict.share': 'Chia sẻ kết quả',
    'verdict.copied': 'Đã sao chép',
    'windows.kicker': 'Khung giờ đẹp',
    'windows.title': 'Top 3 giờ ra sân',
    'windows.body': 'Điểm càng cao thì thời tiết càng ít gây phiền.',
    'hourly.kicker': 'Theo giờ',
    'hourly.title': 'Cảm giác từng khung giờ',
    'hourly.body': 'Dùng phần này nếu bạn muốn tự so từng giờ.',
    'hourly.feels': 'cảm nhận',
    'hourly.rain': 'mưa',
    'hourly.wind': 'gió',
    'prefs.kicker': 'Gu của bạn',
    'prefs.title': 'Chỉnh cho hợp ý',
    'prefs.body': 'Điều chỉnh nếu bạn nhạy với gió, nóng, nắng hoặc giờ chơi.',
    'prefs.start': 'Bắt đầu sau',
    'prefs.end': 'Kết thúc trước',
    'prefs.wind': 'Độ nhạy với gió',
    'prefs.heat': 'Mức chịu nhiệt',
    'prefs.sun': 'Mức chịu UV',
    'saved.kicker': 'Địa điểm đã lưu',
    'saved.title': 'Sân quen của bạn',
    'saved.body': 'Địa điểm đã lưu chỉ nằm trên thiết bị này.',
    'saved.empty': 'Chưa có sân quen. Tìm bên trên rồi bấm vào kết quả để lưu.',
    'saved.goto': 'Mặc định',
    loading: 'Đang kiểm tra trời, gió và cảm giác ra sân...',
    'footer.built': 'Xây dựng bởi Hien Tran. Dữ liệu thời tiết từ Open-Meteo.',
    'footer.website': 'Website cá nhân',
    'footer.blog': 'Blog cá nhân',
    'footer.donate': 'Ủng hộ',
    'donation.kicker': 'Cảm ơn',
    'donation.title': 'Quét mã để ủng hộ',
    'donation.close': 'Đóng hộp ủng hộ',
    'donation.alt': 'Mã QR ủng hộ',
    'donation.body': 'Cảm ơn nhiều. Giờ ra sân thắng điểm tiếp theo nhé.',
    'language.label': 'Ngôn ngữ',
    'language.english': 'Tiếng Anh',
    'language.vietnamese': 'Tiếng Việt',
    'date.label': 'Hôm nay',
    'date.selected': 'Ngày chơi',
    'date.pick': 'Chọn ngày',
    'date.today': 'Hôm nay',
    'share.prefix': 'Chơi hay nghỉ',
    'share.for': 'cho môn',
    'share.in': 'tại',
    'share.bestWindow': 'Khung giờ đẹp nhất',
    'share.score': 'Điểm'
  }
};

export function t(language: Language, key: TranslationKey) {
  return translations[language][key];
}

export function sportLabel(language: Language, sport: Sport) {
  if (language === 'en') return sport;
  if (sport === 'Basketball') return 'Bóng rổ';
  return sport;
}

export function verdictLabel(language: Language, verdict: Verdict) {
  if (language === 'en') return verdict;
  if (verdict === 'Play') return 'Chơi';
  if (verdict === 'Maybe') return 'Cân nhắc';
  return 'Nghỉ';
}

export function weatherLabelFor(language: Language, label: string) {
  if (language === 'en') return label;
  const map: Record<string, string> = {
    Clear: 'Trời quang',
    'Cloud mix': 'Có mây',
    Fog: 'Sương mù',
    Drizzle: 'Mưa phùn',
    Rain: 'Mưa',
    Snow: 'Tuyết',
    'Storm risk': 'Nguy cơ bão',
    Mixed: 'Thời tiết lẫn lộn'
  };
  return map[label] ?? label;
}

export function reasonLabel(language: Language, reason: string) {
  if (language === 'en') return reason;
  const rain = reason.match(/^(\d+)% rain risk$/);
  if (rain) return `nguy cơ mưa ${rain[1]}%`;
  const wind = reason.match(/^(\d+) km\/h wind$/);
  if (wind) return `gió ${wind[1]} km/h`;
  const gusts = reason.match(/^(\d+) km\/h gusts$/);
  if (gusts) return `gió giật ${gusts[1]} km/h`;
  const cool = reason.match(/^feels cool at (\d+)C$/);
  if (cool) return `cảm giác hơi lạnh ${cool[1]}C`;
  const hot = reason.match(/^feels hot at (\d+)C$/);
  if (hot) return `cảm giác nóng ${hot[1]}C`;
  const uv = reason.match(/^UV (\d+) is punchy$/);
  if (uv) return `UV ${uv[1]} khá gắt`;
  const map: Record<string, string> = {
    drizzle: 'mưa phùn',
    rain: 'mưa',
    snow: 'tuyết',
    'storm risk': 'nguy cơ bão',
    fog: 'sương mù',
    mixed: 'thời tiết lẫn lộn',
    'court conditions look friendly': 'điều kiện ra sân khá ổn'
  };
  return map[reason] ?? reason;
}
