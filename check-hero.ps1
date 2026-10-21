$en = Get-Content "D:\AURIC\auric-hotel\v-en.html" -Raw
$ar = Get-Content "D:\AURIC\auric-hotel\v-ar.html" -Raw
foreach ($pair in @(@{l="EN"; h=$en}, @{l="AR"; h=$ar})) {
  Write-Output ("=== " + $pair.l + " ===")
  $m = [regex]::Match($pair.h, "<section[^>]*bg-background[^>]*>")
  Write-Output ("section: " + $m.Value)
  Write-Output ("has Hero.webp: " + ($pair.h -match "Hero.webp"))
  Write-Output ("has next/image hero: " + ($pair.h -match "/_next/image.*Hero"))
  Write-Output ("has video: " + ($pair.h -match "<video"))
  Write-Output ("has source mp4: " + ($pair.h -match "video/mp4"))
  Write-Output ("bg-hero-decoration count: " + [regex]::Matches($pair.h, "bg-hero-decoration").Count)
  Write-Output ("h1: " + ([regex]::Match($pair.h, "<h1[^>]*>([^<]*)</h1>").Groups[1].Value))
  Write-Output ("h1 tracking-tight: " + ($pair.h -match "tracking-tight") + " tracking-none: " + ($pair.h -match "tracking-none"))
  Write-Output ("leading-1.3 (ar): " + ($pair.h -match "leading-\[1\.3\]"))
  Write-Output ("-z-10 decorations: " + [regex]::Matches($pair.h, "\-z-10").Count)
  Write-Output ("aria-hidden count: " + [regex]::Matches($pair.h, "aria-hidden").Count)
  Write-Output ("animate-appear count: " + [regex]::Matches($pair.h, "animate-appear").Count)
  Write-Output ("form checkIn: " + ($pair.h -match "availability-check-in"))
  $loc = if ($pair.l -eq "EN") { "en" } else { "ar" }
  Write-Output ("href /book: " + ($pair.h -match ('href="/' + $loc + '/book"')))
  Write-Output ("href /rooms: " + ($pair.h -match ('href="/' + $loc + '/rooms"')))
}