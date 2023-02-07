#!/usr/bin/env ruby

ver = ARGV[0]
build = ARGV[1]

build_gradle_filepath = "android/app/build.gradle"
xcode_proj_filepath = "ios/ton_keeper.xcodeproj/project.pbxproj"

build_gradle = File.read(build_gradle_filepath)
android_build = build_gradle.match(/^\s*versionCode\s+(\d+)$/)[1]
android_ver = build_gradle.match(/^\s*versionName\s+"([\d\.]+)"$/)[1]

xcode_proj = File.read(xcode_proj_filepath)
ios_build = xcode_proj.match(/CURRENT_PROJECT_VERSION\s*=\s*(\d+);/)[1]
ios_ver = xcode_proj.match(/MARKETING_VERSION\s*=\s*([\d\.]+);/)[1]

if ver.to_s == "" || build.to_s == "" || !build[/^\d+$/] || !ver[/^[\d\.]+$/]
    puts "Usage: scripts/version-bump.rb <version> <build> (e.g. `1.2.3 999`)"
    puts "Current Android version: #{android_ver} (#{android_build})"
    puts "Current iOS version: #{ios_ver} (#{ios_build})"
    exit
end

puts "Setting new version: #{ver} (#{build})"

build_gradle.gsub!(/^(\s*)versionCode\s+\d+$/, "\\1versionCode #{build}")
build_gradle.gsub!(/^(\s*)versionName\s+"[\d\.]+"$/, "\\1versionName \"#{ver}\"")
File.open(build_gradle_filepath, "w"){|f| f.write(build_gradle) }

xcode_proj.gsub!(/CURRENT_PROJECT_VERSION\s*=\s*(\d+);/, "CURRENT_PROJECT_VERSION = #{build};")
xcode_proj.gsub!(/MARKETING_VERSION\s*=\s*([\d\.]+);/, "MARKETING_VERSION = #{ver};")
File.open(xcode_proj_filepath, "w"){|f| f.write(xcode_proj) }
